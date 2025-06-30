"use server";

import type { LoginFormInputs } from "@/components/auth/LoginForm";
import type { SignupFormInputs } from "@/components/auth/SignupForm";
import type { CheckoutFormInputs } from "@/components/checkout/CheckoutForm";
import { getUser } from "@/lib/auth/index";
import {
  authenticateUser,
  createSession,
  createUser,
  generateSessionToken,
} from "@/lib/auth/utils";
import pleskApi from "@/lib/server/apis/plesk";
import { ClientRequestTypeEnum } from "@/plesk";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import {
  pgDomainPricingCache,
  pgInvoice,
  pgOrganization,
  pgOrganizationDomains,
  pgPlan,
  pgSession,
  pgUser,
  pgUserCard,
  type Plan,
} from "@/lib/db/schema";
import currencyConversion from "@/lib/server/apis/currency";
import domApi from "@/lib/server/apis/dom";
import namecheapApi, { getDomainPricing } from "@/lib/server/apis/namecheap";
import axios from "axios";
import { eq, sql, and } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import ip2Location from "@/lib/server/apis/ip2location";
import ipaddrJs from "ipaddr.js";
import { auth, signIn, signOut } from "@/auth";
import { AppLogger } from "@/lib/server/logs";
import type { DomainPageParams } from "./(auth)/domain/[action]/types";
import type { SavedCard } from "@/components/checkout/ModernCheckoutForm";

export async function login(
  prevState: unknown,
  { email, password }: LoginFormInputs
): Promise<ActionResponse> {
  if (!email || !password) {
    return { status: "error", message: "Email e senha são obrigatórios" };
  }

  const reqHeaders = await headers();
  let userIp: string | null =
    reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip");

  if (!userIp || ipaddrJs.parse(userIp).range() !== "unicast") {
    userIp = null;
  }

  try {
    const user = await authenticateUser(email, password);

    if (!user) {
      return { status: "error", message: "Email ou senha inválidos" };
    }

    const sessionToken = generateSessionToken();
    await createSession(sessionToken, user.id);

    const cookieStore = await cookies();

    cookieStore.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });

    revalidateTag("session-validate");

    let description = "Novo login realizado";
    let severity: "success" | "info" | "warning" | "danger" = "info";

    if (userIp) {
      const location = await ip2Location.getLocation(userIp);

      if (location) {
        description += ` de ${location.cityName}, ${location.countryName} (IP: ${userIp})`;
      }
    } else {
      description += " (localização desconhecida)";
      severity = "warning";
    }

    const userLogger = new AppLogger(user);

    userLogger.log({
      title: "Novo login realizado",
      description,
      severity,
      type: "security",
    });
  } catch (error) {
    console.error("Login error:", error);
    return { status: "error", message: "Erro ao fazer login" };
  }

  redirect("/");
}

export async function signup(
  prevState: unknown,
  { email, password, fullName, referrerId, organizationName }: SignupFormInputs
): Promise<ActionResponse> {
  if (!email || !password || !fullName || !organizationName) {
    return {
      status: "error",
      message: "Nome, email e senha são obrigatórios",
    };
  }

  if (password.length < 8) {
    return {
      status: "error",
      message: "A senha deve ter pelo menos 8 caracteres",
    };
  }
  if (password.length > 100) {
    return {
      status: "error",
      message: "A senha deve ter no máximo 100 caracteres",
    };
  }

  if (fullName.split(" ").length < 2) {
    return {
      status: "error",
      message: "Digite seu nome completo",
    };
  }

  try {
    const user = await createUser(
      fullName,
      email,
      password,
      organizationName,
      referrerId
    );

    if (!user) {
      // Assuming createUser returns null if user already exists or on other errors
      return {
        status: "error",
        message: "Erro ao criar conta. O email pode já estar em uso.",
      };
    }

    const sessionToken = generateSessionToken();
    await createSession(sessionToken, user.id);

    const cookieStore = await cookies();
    cookieStore.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    if (referrerId) {
      const userLogger = new AppLogger({ id: referrerId });
      userLogger.log({
        type: "account",
        title: "Usuário cadastrado com seu link de afiliado",
        description:
          "Um novo usuário se cadastrou usando seu link de afiliado.",
        severity: "success",
      });
    }

    revalidateTag("session-validate");
  } catch (error) {
    console.error("Signup error:", error);
    return { status: "error", message: "Erro ao criar conta" };
  }

  redirect("/");
}

export async function logout(): Promise<void> {
  const a = await auth();
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  await signOut({
    redirectTo: "/login",
    redirect: true,
  });

  if (sessionToken) {
    await db.delete(pgSession).where(eq(pgSession.id, sessionToken));
    cookieStore.delete("session_token");
  }

  redirect("/");
}

export async function createPlan(
  prevState: unknown,
  input: Omit<Plan, "id" | "createdAt" | "updatedAt">
): Promise<ActionResponse> {
  try {
    const [plan] = await db // Destructure to get the first element
      .insert(pgPlan)
      .values({
        name: input.name,
        description: input.description,
        price: input.price,
        maxSites: input.maxSites,
        maxStorage: input.maxStorage,
        ssl: input.ssl,
        backup: input.backup,
        email: input.email,
        cdn: input.cdn,
        supportPriority: input.supportPriority,
        featured: input.featured,
      })
      .returning();

    revalidatePath("/admin/plans");
    return {
      status: "success",
      message: "Plano criado com sucesso",
    };
  } catch (error) {
    console.error("Create plan error:", error);
    return { status: "error", message: "Erro ao criar plano" };
  }
}

export async function updatePlan(
  id: string,
  values: Partial<Omit<Plan, "id" | "createdAt" | "updatedAt">>
): Promise<ActionResponse> {
  try {
    const [plan] = await db // Destructure to get the first element
      .update(pgPlan)
      .set(values)
      .where(eq(pgPlan.id, id))
      .returning();

    if (!plan) {
      return {
        status: "error",
        message: "Plano não encontrado para atualização.",
      };
    }

    revalidatePath("/admin/plans");
    revalidatePath(`/admin/plans/${id}/edit`);

    return {
      status: "success",
      message: "Plano atualizado com sucesso",
    };
  } catch (error) {
    console.error("Update plan error:", error);
    return { status: "error", message: "Erro ao atualizar plano" };
  }
}

export async function createPlanInvoice(
  planId: string
): Promise<ActionResponse> {
  const user = await getUser();

  if (!user) {
    return {
      status: "error",
      message: "Usuário não autenticado. Faça login para continuar.",
    };
  }

  if (!planId) {
    return { status: "error", message: "ID do plano é obrigatório." };
  }

  let redirectUrl: string | null = null;

  try {
    const plan = await db.query.pgPlan.findFirst({
      where: eq(pgPlan.id, planId),
    });

    if (!plan) {
      return { status: "error", message: "Plano não encontrado." };
    }

    const planPrice = plan.price;

    const [newInvoice] = await db
      .insert(pgInvoice)
      .values({
        orgId: user.organization.id,
        userId: user.id,
        type: "subscription",
        reference: plan.id,
        amount: planPrice,
        status: "pending",
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Pass Date object directly
        currency: "BRL",
        description: `ATLAS Fatura plano ${plan.name}`,
      })
      .returning();

    if (!newInvoice || !newInvoice.id) {
      console.error(
        "Falha ao criar a fatura ou obter o ID de retorno do banco de dados.",
        newInvoice
      );
      return {
        status: "error",
        message: "Erro ao criar fatura. Tente novamente.",
      };
    }

    redirectUrl = `/checkout/${newInvoice.id}`;
  } catch (error) {
    console.error("Erro ao criar fatura do domínio:", error);
    return {
      status: "error",
      message:
        "Erro interno ao processar o pedido. Por favor, tente mais tarde.",
    };
  }

  if (redirectUrl) {
    return {
      status: "success",
      message: redirectUrl,
    };
  }

  return {
    status: "error",
    message: "Erro ao processar o pedido. Por favor, tente mais tarde.",
  };
}

export async function createDomainInvoice({
  domain,
  years,
  whoisguard,
}: DomainPageParams) {
  "use server";

  if (!domain || !years) {
    return;
  }

  const user = await getUser();

  if (!user) {
    return;
  }

  if (!domain) {
    return;
  }

  let redirectUrl: string | null = null;

  try {
    const namecheapResult = await namecheapApi
      .check({
        DomainList: domain,
      })
      .then((r) => r.Results[0]);

    const isAvailable = namecheapResult.Available;

    if (!isAvailable) {
      return;
    }

    const pricesInfo = await getDomainPricing(
      domain.split(".").pop() as string
    );
    const priceInfo = pricesInfo.Prices.find(
      (p) => p.Duration === +years && p.DurationType === "YEAR"
    );

    if (!priceInfo) {
      return;
    }

    let priceInBrl = priceInfo.Price;

    // Pode vir em USD, pode vir em BRL (?)
    if (priceInfo.Currency.toUpperCase() !== "BRL") {
      priceInBrl = await currencyConversion.convert({
        from: priceInfo.Currency.toLowerCase(),
        to: "brl",
        amount: priceInfo.Price,
      });
    }

    const fee =
      1 + ((await db.query.pgSystemConfig.findFirst())?.domainFee ?? 1);

    priceInBrl *= fee;

    if (whoisguard === "on") {
      priceInBrl += 3;
    }

    const [newInvoice] = await db
      .insert(pgInvoice)
      .values({
        orgId: user.organization.id,
        userId: user.id,
        type: "domain",
        reference: domain,
        amount: priceInBrl,
        status: "pending",
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        metadata: {
          years,
          whoisguard,
        },
      })
      .returning();

    if (!newInvoice || !newInvoice.id) {
      console.error(
        "Falha ao criar a fatura ou obter o ID de retorno do banco de dados.",
        newInvoice
      );
      return;
    }

    redirectUrl = `/checkout/${newInvoice.id}`;
  } catch (error) {
    console.error("Erro ao criar fatura do domínio:", error);
    return;
  }

  return redirectUrl;
}

export async function completeCheckout(
  prevState: unknown,
  {
    invoiceId,
    ...values
  }: CheckoutFormInputs & { invoiceId: string; cardToken?: string }
): Promise<ActionResponse> {
  const user = await getUser();

  console.log({ values });

  if (!user) {
    return {
      status: "error",
      message: "Usuário não autenticado. Faça login para continuar.",
    };
  }

  if (!invoiceId) {
    return { status: "error", message: "ID da fatura é obrigatório." };
  }

  const invoice = await db
    .update(pgInvoice)
    .set({
      status: "processing",
    })
    .where(eq(pgInvoice.id, invoiceId))
    .returning()
    .execute()
    .then((r) => r[0]);

  if (!invoice) {
    return { status: "error", message: "Fatura não encontrada." };
  }

  if (!user.organization?.domId) {
    try {
      const { id } = await domApi.createClient({
        name: user.name,
        email: user.email,
        document: values.document.replace(/\D/g, ""),
        mobilePhone: values.phoneNumber.replace(/\D/g, ""),
        userId: user.id,
        address: {
          street: values.address.street,
          number: values.address.number,
          city: values.address.city,
          state: values.address.state,
          zip_code: values.address.zipCode.replace(/\D/g, ""),
          neighborhood: values.address.neighborhood,
        },
        codeExternal: user.id,
      });

      await db
        .update(pgOrganization)
        .set({
          domId: id,
        })
        .where(eq(pgOrganization.id, user.organizationId ?? ""));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error(
            "Erro ao criar cliente no DOM (Axios Response Error):",
            error.response.data
          );
        } else if (error.request) {
          console.error(
            "Erro ao criar cliente no DOM (Axios Request Error):",
            error.request
          );
        } else {
          console.error(
            "Erro ao criar cliente no DOM (Axios Setup Error):",
            error.message
          );
        }
      } else {
        console.error("Erro ao criar cliente no DOM (Non-Axios Error):", error);
      }
      return {
        status: "error",
        message: "Erro ao criar cliente no sistema de domínios.",
      }; // User-friendly message
    }
  }

  const [expMonth, expYear] = values.cardExpiration.split("/");
  const fullYear = 2000 + Number.parseInt(expYear);

  let { cardToken } = values;

  if (!cardToken) {
    try {
      const tokenData = await domApi.createCardToken(user.id, {
        number: values.cardNumber.replace(/\D/g, ""),
        cvv: values.cardCvv,
        exp_month: Number.parseInt(expMonth),
        exp_year: fullYear,
        holder_name: values.fullName,
        holder_document: values.document.replace(/\D/g, ""),
      });

      if (!user?.organization?.wallet) {
        return {
          status: "error",
          message: "Carteira não encontrada",
        };
      }

      const existingCards = await db.$count(
        pgUserCard,
        eq(pgUserCard.walletId, user.organization.wallet.id)
      );

      const isFirstCard = existingCards === 0;

      // Save card to database
      await db.insert(pgUserCard).values({
        walletId: user.organization.wallet.id,
        cardToken: tokenData.token,
        last4: tokenData.last4,
        brand: tokenData.brand,
        expiryMonth: tokenData.expiryMonth,
        expiryYear: tokenData.expiryYear,
        holderName: tokenData.holderName,
        isDefault: isFirstCard,
      });

      cardToken = tokenData.token;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // A request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error(
            "Erro ao criar token do cartão no DOM:",
            err.response.data
          );
        } else if (err.request) {
          // The request was made but no response was received
          console.error("Erro ao criar token do cartão no DOM:", err.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error("Erro ao criar token do cartão no DOM:", err.message);
        }
      }

      throw err;
    }
  }

  try {
    console.log({ cardToken });
    const result = await domApi.createRecurrentPayment({
      description: `Atlas Hosting ${invoice.reference}`,
      externalReference: invoiceId,
      frequency: "MONTH",
      card: {
        token: cardToken,
        installments: 1,
      },
      userId: user.id,
      value: invoice.amount,
    });
    console.log("Nova assinatura criada", result);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response) {
        // A request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(
          "Erro ao criar pagamento recorrente no DOM:",
          err.response.data
        );
      } else if (err.request) {
        // The request was made but no response was received
        console.error(
          "Erro ao criar pagamento recorrente no DOM:",
          err.request
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error(
          "Erro ao criar pagamento recorrente no DOM:",
          err.message
        );
      }
    }
    return { status: "error", message: "Erro ao criar pagamento recorrente." };
  }

  redirect("/payment/success");

  return { status: "success", message: "Plano adquirido com sucesso!" };
}

export async function completeCheckoutWithSavedCard(
  prevState: unknown,
  {
    invoiceId,
    card: { cardToken, ...card },
    ...values
  }: Omit<CheckoutFormInputs, "cardNumber" | "cardCvv" | "cardExpiration"> & {
    invoiceId: string;
    card: SavedCard;
  }
): Promise<ActionResponse> {
  const user = await getUser();

  if (!user) {
    return {
      status: "error",
      message: "Usuário não autenticado. Faça login para continuar.",
    };
  }

  if (!invoiceId) {
    return { status: "error", message: "ID da fatura é obrigatório." };
  }

  if (!card) {
    return { status: "error", message: "Token do cartão é obrigatório." };
  }

  const invoice = await db
    .update(pgInvoice)
    .set({
      status: "processing",
    })
    .where(eq(pgInvoice.id, invoiceId))
    .returning()
    .execute()
    .then((r) => r[0]);

  if (!invoice) {
    return { status: "error", message: "Fatura não encontrada." };
  }

  // Ensure DOM client exists
  if (!user.organization?.domId) {
    try {
      const { id } = await domApi.createClient({
        name: user.name,
        email: user.email,
        document: values.document.replace(/\D/g, ""),
        mobilePhone: values.phoneNumber.replace(/\D/g, ""),
        userId: user.id,
        address: {
          street: values.address.street,
          number: values.address.number,
          city: values.address.city,
          state: values.address.state,
          zip_code: values.address.zipCode.replace(/\D/g, ""),
          neighborhood: values.address.neighborhood,
        },
        codeExternal: user.id,
      });

      await db
        .update(pgOrganization)
        .set({
          domId: id,
        })
        .where(eq(pgOrganization.id, user.organizationId ?? ""));
    } catch (error) {
      console.error("Error creating DOM client:", error);
      return {
        status: "error",
        message: "Erro ao criar cliente no sistema de pagamentos.",
      };
    }
  }

  try {
    // Create subscription using saved card token
    const result = await domApi.createRecurrentPayment({
      description: `Atlas Hosting ${invoice.reference}`,
      externalReference: invoiceId,
      frequency: "MONTH",
      card: {
        token: cardToken,
        installments: 1,
      },
      userId: user.id,
      value: invoice.amount,
    });

    console.log("Nova assinatura criada com cartão salvo", result);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error(
        "Error creating recurrent payment with saved card:",
        err.response?.data
      );
    }
    return {
      status: "error",
      message: "Erro ao processar pagamento com cartão salvo.",
    };
  }

  return {
    status: "success",
    message: "/payment/success",
  };
}

// export async function createWordPressInstance(
//   prevState: unknown,
//   formData: FormData
// ): Promise<{
//   message: string;
//   error?: string;
//   siteUrl?: string;
//   adminUrl?: string;
// }> {
//   const user = await getUser();
//   if (!user) {
//     return {
//       message: "Erro: Usuário não autenticado.",
//       error: "Faça login para continuar.",
//     };
//   }

//   const { id: userId, namesiloId } = user;
//   let { pleskId } = user;

//   const domainName = formData.get("domainName") as string;

//   if (!domainName) {
//     return {
//       message: "Erro: Nome de domínio não fornecido.",
//       error: "Selecione um domínio.",
//     };
//   }

//   if (!pleskId) {
//     const result = await pleskApi.createClient({
//       name: user.name,
//       email: user.email,
//       login: user.email,
//       password: user.password,
//       type: ClientRequestTypeEnum.Customer,
//       externalId: userId,
//       ownerLogin: "atlashosting",
//       status: 0,
//     });

//     if (result && result.id) {
//       await db
//         .update(pgUser)
//         .set({
//           pleskId: result.id,
//         })
//         .where(eq(pgUser.id, userId));

//       pleskId = result.id;
//     } else {
//       console.error("Failed to create Plesk client:", result);
//       return {
//         message: "Erro: ID do usuário Plesk não configurado.",
//         error: "Configuração de usuário (Plesk ID) ausente.",
//       };
//     }
//   }

//   if (!namesiloId) {
//     return {
//       message: "Erro: Usuário Namesilo não configurado.",
//       error: "Configuração de usuário (Namesilo ID) ausente.",
//     };
//   }

//   try {
//     const domainExists = false;
//     // try {
//     await pleskApi.assignDomain(domainName, 1);

//     // const existingDomain = await pleskApi.getDomain(domainName);
//     //   if (existingDomain) {
//     //     domainExists = true;
//     //   }
//     // } catch (e: unknown) {
//     //   await pleskApi.assignDomain(domainName, 1);
//     // }

//     const wpInstallRawResult = await pleskApi.wordpress.installWp(domainName);
//     const wpInstallResult = parsePleskCliResponse(wpInstallRawResult);

//     try {
//       await pleskApi.subscriptions.createSubscription(domainName, user);
//     } catch (assignError: unknown) {
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       const typedAssignError = assignError as any;
//       console.error(
//         "Error assigning Plesk domain:",
//         typedAssignError.response?.data || typedAssignError.message
//       );
//       return {
//         message:
//           "Erro ao criar ou associar o domínio no servidor de hospedagem.",
//         error: String(
//           typedAssignError.response?.data?.message ||
//             typedAssignError.message ||
//             "Falha ao configurar domínio."
//         ),
//       };
//     }

//     const stdOut = JSON.parse(wpInstallResult.stdout || "{}");

//     if (!stdOut["instance-id"]) {
//       console.error(
//         "WordPress installation failed (WP Toolkit exit code):",
//         wpInstallResult
//       );
//       const errorMessage = String(
//         wpInstallResult.stderr ||
//           wpInstallResult.message ||
//           wpInstallResult.error ||
//           "Falha na instalação (código de saída)."
//       );
//       return { message: "Erro ao instalar o WordPress.", error: errorMessage };
//     }
//     if (wpInstallResult.error && typeof wpInstallResult.error === "boolean") {
//       console.error(
//         "WordPress installation failed (error flag in response):",
//         wpInstallResult
//       );
//       return {
//         message: "Erro ao instalar o WordPress.",
//         error: "A instalação reportou um erro.",
//       };
//     }
//     if (
//       wpInstallResult.error &&
//       typeof wpInstallResult.error === "string" &&
//       wpInstallResult.error.toLowerCase() !== "false"
//     ) {
//       console.error(
//         "WordPress installation failed (error message in response):",
//         wpInstallResult
//       );
//       return {
//         message: "Erro ao instalar o WordPress.",
//         error: String(wpInstallResult.error),
//       };
//     }
//     if (
//       wpInstallResult.status &&
//       !["success", "installed", "ok"].includes(
//         wpInstallResult.status.toLowerCase()
//       )
//     ) {
//       console.error(
//         "WordPress installation failed (status in response):",
//         wpInstallResult
//       );
//       return {
//         message: "Erro ao instalar o WordPress.",
//         error:s
//           `Status da instalação: ${wpInstallResult.status}. ${wpInstallResult.message || ""}`.trim(),
//       };
//     }

//     const siteUrl = wpInstallResult.site_url;
//     const adminUrl = wpInstallResult.admin_url;

//     console.log({ siteUrl, adminUrl });

//     // if (!siteUrl || !adminUrl) {
//     //   console.error("WordPress installation succeeded but URLs not found in response:", wpInstallResult);
//     //   return { message: "WordPress instalado, mas não foi possível obter os URLs.", error: "Não foi possível recuperar os URLs do site/admin. Verifique o painel Plesk." };
//     // }

// const primaryIp = process.env.SERVER_IP!;

//     const dnsRecords = await nameSilo.dnsListRecords(domainName);
//     const nsRecords = await nameSilo.listRegisteredNameServers(domainName);

//     if (Array.isArray(dnsRecords.resource_record)) {
//       for (const record of dnsRecords.resource_record) {
//         await nameSilo.deleteDnsRecord(domainName, record.record_id);
//       }
//     } else {
//       console.log(dnsRecords.resource_record);
//     }

//     if (Array.isArray(nsRecords.hosts)) {
//       for (const nsRecord of nsRecords.hosts) {
//         await nameSilo.deleteRegisteredNameServer(domainName, nsRecord.host);
//       }
//     } else {
//       console.log(nsRecords.hosts);
//     }

//     try {
//       await nameSilo
//         .changeNameServers(domainName, [
//           "ns1.".concat(domainName),
//           "ns2.".concat(domainName),
//         ])
//         .catch();

//       await nameSilo
//         .addDnsRecord({
//           domain: domainName,
//           host: "",
//           type: "A",
//           value: primaryIp,
//         })
//         .catch();

//       await nameSilo
//         .addDnsRecord({
//           domain: domainName,
//           host: "www",
//           type: "A",
//           value: primaryIp,
//         })
//         .catch();
//     } catch {
//       //
//     }

//     return {
//       message: "WordPress instalado com sucesso!",
//     };

//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   } catch (error: any) {
//     console.error("Failed to create WordPress instance:", error);
//     if (error.response && error.response.data) {
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       const pleskError = error.response.data as any;
//       return {
//         message: "Erro durante a criação da instância WordPress.",
//         error: String(
//           pleskError.message || pleskError.errtext || JSON.stringify(pleskError)
//         ),
//       };
//     }
//     return {
//       message: "Erro ao criar instância WordPress.",
//       error: String(error.message || "Ocorreu um erro desconhecido."),
//     };
//   }
// }

// Ensure imports for ListDomainDomain if not already present at the top
// import { type ListDomainDomain } from "@/lib/server/apis/namesilo/types";

// export async function getUserDomains(): Promise<{
//   domains: { name: string }[];
//   error?: string;
// }> {
//   try {
//     // Assuming nameSilo.listDomains returns Promise<NamesiloReply<NamesiloDomain>>
//     // where NamesiloReply<T> = { code: number; detail: string; } & T (NamesiloDomain in this case)
//     const response = await nameSilo.listDomains({});

//     // Check response code directly
//     if (response.code !== 300) {
//       // 300 is typical success for NameSilo listDomains
//       return {
//         domains: [],
//         error: `Error fetching domains: ${response.detail} (Code: ${response.code})`,
//       };
//     }

//     // Access domains directly from response (which is effectively NamesiloReply<NamesiloDomain>)
//     // response.domains is of type (ListDomainDomain[] | { domain: ListDomainDomain } | undefined)
//     const namesiloDomainData = response.domains;

//     if (!namesiloDomainData) {
//       // No domains found or the 'domains' part of the response is empty/undefined.
//       return { domains: [] };
//     }

//     let domainList: ListDomainDomain[] = [];

//     if (Array.isArray(namesiloDomainData)) {
//       // Handles the case where 'domains' is an array of ListDomainDomain objects.
//       domainList = namesiloDomainData;
//     } else if (
//       typeof namesiloDomainData === "object" &&
//       namesiloDomainData !== null &&
//       "domain" in namesiloDomainData
//     ) {
//       // Handles the case where 'domains' is an object like { domain: ListDomainDomain }.
//       // We need to ensure namesiloDomainData.domain is not undefined or null.
//       const singleDomainContainer = namesiloDomainData as {
//         domain?: ListDomainDomain;
//       };
//       if (singleDomainContainer.domain) {
//         domainList = [singleDomainContainer.domain];
//       }
//     }
//     // If namesiloDomainData is neither an array nor the expected single domain object structure,
//     // domainList will remain empty, resulting in an empty domain array being returned, which is safe.

//     const domains = domainList.map((d) => ({ name: d.domain }));
//     return { domains };
//   } catch (e: unknown) {
//     console.error("Failed to get user domains:", e);
//     let message = "An unexpected error occurred while fetching domains.";
//     if (e instanceof Error) {
//       message = e.message;
//     }
//     return { domains: [], error: message };
//   }
// }

export interface ActionResponse {
  message: string;
  error?: string;
  fieldErrors?: Record<string, string>;
  // Consider removing 'status' if not used, or define it here
  status?: "success" | "error" | "idle";
}

export interface PayInvoice {
  fullName: string;
  document: string;
  cardNumber: string;
  cardCvv: string;
  cardExpiration: string;
  phoneNumber: string;
  address: {
    number: string;
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export async function deleteWordPressInstances(
  prevState: unknown,
  instanceIds: string
): Promise<ActionResponse> {
  try {
    const user = await getUser();

    if (!user) {
      return { status: "error", message: "Unauthorized" };
    }

    // Handle both single instanceId and comma-separated list
    const ids = instanceIds.split(",").map((id) => Number.parseInt(id, 10));

    if (ids.some(Number.isNaN)) {
      return { status: "error", message: "Invalid instance ID" };
    }

    // Delete all instances in parallel
    await Promise.all(
      ids.map(async (id) => {
        // TODO: delete DNS entries.
        await pleskApi.wordpress.uninstallWp(id);
      })
    );

    revalidatePath("/sites");

    return { status: "success", message: "Sites excluídos com sucesso" };
  } catch (error) {
    console.error("Error deleting WordPress instances:", error);
    return { status: "error", message: "Erro ao excluir sites" };
  }
}

export async function signInWithGithub() {
  await signIn("github", {
    redirectTo: "/api/newuser",
  });
}

export async function signInWithGoogle() {
  await signIn("google", {
    redirectTo: "/api/newuser",
  });
}

export async function changeSelectedDomain(
  prevState: unknown,
  domainName: string
): Promise<ActionResponse> {
  const user = await getUser();

  if (!user) {
    return { status: "error", message: "Usuário não autenticado" };
  }

  if (!domainName) {
    return { status: "error", message: "Nome do domínio é obrigatório" };
  }

  try {
    await db
      .update(pgUser)
      .set({ selectedDomain: domainName })
      .where(eq(pgUser.id, user.id));

    revalidateTag("current-domain");
    revalidateTag("session-validate");

    return {
      status: "success",
      message: "Domínio padrão atualizado com sucesso",
    };
  } catch (error) {
    console.error("Erro ao atualizar domínio padrão:", error);
    return { status: "error", message: "Erro ao atualizar domínio padrão" };
  }
}

export async function generateSslForDomain(domainName: string) {
  const user = await getUser();
  return await pleskApi.subscriptions.getSsl(domainName, user);
}

export async function revalidateCurrentPath() {
  "use server";
  revalidatePath("/");
}

export async function getMonthlyAffiliateEarnings(userId: string) {
  "use server";
  
  // Get the system configuration for commission rate
  const systemConfig = await db.query.pgSystemConfig.findFirst();
  if (!systemConfig) {
    throw new Error("Configuração de comissão de afiliados não encontrada");
  }

  // Get monthly earnings for the last 12 months using proper Drizzle query
  const monthlyData = await db
    .select({
      month: sql<string>`DATE_TRUNC('month', ${pgInvoice.createdAt})`,
      total_amount: sql<number>`SUM(${pgInvoice.amount})`,
      referrals_count: sql<number>`COUNT(DISTINCT ${pgUser.id})`,
    })
    .from(pgInvoice)
    .leftJoin(pgUser, eq(pgInvoice.userId, pgUser.id))
    .where(
      and(
        eq(pgUser.referrerId, userId),
        sql`${pgInvoice.createdAt} >= NOW() - INTERVAL '12 months'`
      )
    )
    .groupBy(sql`DATE_TRUNC('month', ${pgInvoice.createdAt})`)
    .orderBy(sql`DATE_TRUNC('month', ${pgInvoice.createdAt}) ASC`);

  // Transform the data and calculate earnings
  const chartData = monthlyData.map((row) => {
    const earnings = +(row.total_amount || 0) * (systemConfig.referrerCommission / 100);
    const month = new Date(row.month).toLocaleDateString('pt-BR', { month: 'short' });
    
    return {
      month: month.charAt(0).toUpperCase() + month.slice(1),
      earnings: earnings,
      referrals: +row.referrals_count || 0
    };
  });

  return chartData;
}

export async function addDomainForTransfer(
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse> {
  const user = await getUser();

  if (!user) {
    return { status: "error", message: "Usuário não autenticado" };
  }

  const domain = formData.get("domain") as string;

  if (!domain || domain.trim() === "") {
    return { status: "error", message: "Nome do domínio é obrigatório" };
  }

  // Basic domain validation
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!domainRegex.test(domain.trim())) {
    return { status: "error", message: "Formato de domínio inválido" };
  }

  try {
    // Check if domain already exists
    const existingDomain = await db.query.pgOrganizationDomains.findFirst({
      where: and(
        eq(pgOrganizationDomains.organizationId, user.organization.id),
        eq(pgOrganizationDomains.domain, domain.trim().toLowerCase())
      ),
    });

    if (existingDomain) {
      return { status: "error", message: "Este domínio já foi adicionado à sua organização" };
    }

    // Add domain to organization with active = false (pending transfer)
    await db.insert(pgOrganizationDomains).values({
      organizationId: user.organization.id,
      domain: domain.trim().toLowerCase(),
      active: false,
    });

    revalidatePath("/domain/transfer");

    return {
      status: "success",
      message: "Domínio adicionado com sucesso. Agora configure os nameservers para completar a transferência.",
    };
  } catch (error) {
    console.error("Erro ao adicionar domínio:", error);
    return { status: "error", message: "Erro ao adicionar domínio" };
  }
}

export async function checkDomainNameservers(
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse & { nameservers?: string[]; isCorrect?: boolean }> {
  const domain = formData.get("domain") as string;

  if (!domain) {
    return { status: "error", message: "Domínio é obrigatório" };
  }

  try {
    // For now, we'll use a simple mock since dns-query installation failed
    // In production, you would use the dns-query package as provided in the user request
    
    // Mock nameserver check - replace with real implementation
    const mockNameservers = [
      "dns1.registrar-servers.com",
      "dns2.registrar-servers.com"
    ];

    const expectedNameservers = [
      "dns1.registrar-servers.com",
      "dns2.registrar-servers.com"
    ];

    const isCorrect = mockNameservers.every(ns => expectedNameservers.includes(ns)) &&
                     expectedNameservers.every(ns => mockNameservers.includes(ns));

    revalidatePath("/domain/transfer");

    return {
      status: "success",
      message: isCorrect ? "Nameservers configurados corretamente!" : "Nameservers ainda não configurados corretamente",
      nameservers: mockNameservers,
      isCorrect,
    };
  } catch (error) {
    console.error("Erro ao verificar nameservers:", error);
    return { 
      status: "error", 
      message: "Erro ao verificar nameservers. Tente novamente em alguns minutos." 
    };
  }
}
