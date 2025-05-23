"use server";

import { LoginFormInputs } from "@/components/auth/LoginForm";
import { SignupFormInputs } from "@/components/auth/SignupForm";
import { CheckoutFormInputs } from "@/components/checkout/CheckoutForm";
import {
  authenticateUser,
  createSession,
  createUser,
  generateSessionToken,
  getUser,
} from "@/lib/auth/index";
import nameSilo from "@/lib/server/apis/namesilo";
import { type ListDomainDomain } from "@/lib/server/apis/namesilo/types";
import pleskApi from "@/lib/server/apis/plesk";
import { ClientRequestTypeEnum } from "@/plesk";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import {
  featureTable,
  invoiceTable,
  namecheapIntegration,
  planFeature,
  plansTable,
  sessionTable,
  userTable,
} from "@/lib/db/schema";
import domApi from "@/lib/server/apis/dom";
import { NamesiloBoolean } from "@/lib/server/apis/namesilo/types";
import axios from "axios";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import namecheapApi from "@/lib/server/apis/namecheap";
import { random } from "lodash";
import { randomBytes } from "@noble/hashes/utils";
import { hash, hashWithEncodeKey } from "@/lib/auth/scrypt";

export async function login(
  prevState: unknown,
  { email, password }: LoginFormInputs
): Promise<ActionResponse> {
  if (!email || !password) {
    return { status: "error", message: "Email e senha são obrigatórios" };
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
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  } catch (error) {
    console.error("Login error:", error);
    return { status: "error", message: "Erro ao fazer login" };
  }

  redirect("/");
}

export async function signup(
  prevState: unknown,
  { email, password, fullName }: SignupFormInputs
): Promise<ActionResponse> {
  if (!email || !password || !fullName) {
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
    const user = await createUser(fullName, email, password);

    if (!user) {
      // Assuming createUser returns null if user already exists or on other errors
      return {
        status: "error",
        message: "Erro ao criar conta. O email pode já estar em uso.",
      };
    }

    const randomPassword = randomBytes(10).toHex();
    const hashedPassword = await hashWithEncodeKey(randomPassword);

    const nameCheapUser = await namecheapApi.createUser({
      AcceptTerms: true,
      Address1: "Placeholder",
      City: "Placeholder",
      Country: "BR",
      EmailAddress: email,
      FirstName: fullName.split(" ")[0],
      LastName: fullName.split(" ")[1],
      NewUserName: user.id.replace(/\-/g, ""),
      NewUserPassword: randomPassword,
      Phone: "5583912345678",
      StateProvince: "Placeholder",
      Zip: "58045010",
    });

    const { id: namecheapId } = (
      await db
        .insert(namecheapIntegration)
        .values({
          password: hashedPassword,
          username: user.id.replace(/\-/g, ""),
          userId: user.id,
          namecheapId: nameCheapUser.UserId!,
        })
        .returning()
    )[0];

    await db
      .update(userTable)
      .set({
        namecheapId,
      })
      .where(eq(userTable.id, user.id));

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
  } catch (error) {
    console.error("Signup error:", error);
    return { status: "error", message: "Erro ao criar conta" };
  }

  redirect("/");
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (sessionToken) {
    await db.delete(sessionTable).where(eq(sessionTable.id, sessionToken));
    cookieStore.delete("session_token");
  }

  redirect("/");
}

export async function buyDomain(
  prevState: unknown,
  {
    address,
    cardCvv,
    cardExpiration,
    cardNumber,
    document,
    fullName,
    phoneNumber,
    invoiceId,
    cardToken,
  }: CheckoutFormInputs & { invoiceId: string; cardToken: string }
): Promise<ActionResponse> {
  const user = await getUser();

  if (!user) {
    return { status: "error", message: "Usuário não autenticado" };
  }

  if (!user.namesiloId) {
    user.namesiloId = await nameSilo.createContact();

    await db
      .update(userTable)
      .set({
        namesiloId: user.namesiloId,
      })
      .where(eq(userTable.id, user.id));
  }

  if (!invoiceId || !cardToken) {
    return { status: "error", message: "Dados de pagamento inválidos" };
  }

  const invoice = await db.query.invoiceTable.findFirst({
    where: eq(invoiceTable.id, invoiceId),
  });

  if (!invoice) {
    return { status: "error", message: "Fatura não encontrada" };
  }

  if (invoice?.type !== "domain") {
    return { status: "error", message: "Fatura não é um domínio" };
  }

  const result = await nameSilo.registerDomain({
    domain: invoice?.reference,
    years: 1,
    portfolio: user.namesiloId,
    private: NamesiloBoolean.True,
  });

  if (!result) {
    return { status: "error", message: "Erro ao registrar domínio" };
  }

  if (result?.code !== 300) {
    return { status: "error", message: result?.detail };
  }

  return { status: "success", message: "Domínio registrado com sucesso" };
}

export async function createFeature(
  prevState: unknown,
  data: { description: string; reference?: string }
) {
  await db.insert(featureTable).values(data);

  revalidatePath("/admin");

  return { status: "success", message: "Feature criada com sucesso!" };
}

export async function createPlan(
  prevState: unknown,
  data: { name: string; description: string; price: number; features: string[] }
) {
  const [plan] = await db
    .insert(plansTable)
    .values({
      name: data.name,
      description: data.description,
      price: data.price,
    })
    .returning();

  if (plan && data.features.length) {
    await db.insert(planFeature).values(
      data.features.map((featureId) => ({
        planId: plan.id,
        featureId,
      }))
    );
  }

  revalidatePath("/admin");

  return { status: "success", message: "Plano criado com sucesso!" };
}

export async function createPlanInvoice(
  prevState: unknown,
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
    const plan = await db.query.plansTable.findFirst({
      where: eq(plansTable.id, planId),
    });

    if (!plan) {
      return { status: "error", message: "Plano não encontrado." };
    }

    const planPrice = plan.price;

    const [newInvoice] = await db
      .insert(invoiceTable)
      .values({
        userId: user.id,
        type: "subscription",
        reference: plan.id,
        amount: planPrice,
        status: "pending",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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

    domApi.createSubscription(user.id, newInvoice.id);

    redirectUrl = `/checkout/${newInvoice.id}`;
  } catch (error) {
    console.error("Erro ao criar fatura do plano:", error);
    return {
      status: "error",
      message:
        "Erro interno ao processar o pedido. Por favor, tente mais tarde.",
    };
  }

  console.log(redirectUrl);

  if (redirectUrl) {
    redirect(redirectUrl);
  }

  return {
    status: "error",
    message: "Erro ao processar o pedido. Por favor, tente mais tarde.",
  };
}

export async function buyPlan(
  prevState: unknown,
  {
    invoiceId,
    ...values
  }: CheckoutFormInputs & { invoiceId: string; cardToken: string }
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

  const invoice = await db.query.invoiceTable.findFirst({
    where: eq(invoiceTable.id, invoiceId),
  });

  if (!invoice) {
    return { status: "error", message: "Fatura não encontrada." };
  }

  const plan = await db.query.plansTable.findFirst({
    where: eq(plansTable.id, invoice.reference),
  });

  if (!plan) {
    return { status: "error", message: "Plano não encontrado." };
  }

  if (!user.domId) {
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
        .update(userTable)
        .set({
          domId: id,
        })
        .where(eq(userTable.id, user.id));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // A request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error("Erro ao criar cliente no DOM:", error.response.data);
        } else if (error.request) {
          // The request was made but no response was received
          console.error("Erro ao criar cliente no DOM:", error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error("Erro ao criar cliente no DOM:", error.message);
        }
      }
      return { status: "error", message: "Erro ao criar cliente no DOM." };
    }
  }

  if (!user.pleskId) {
    const result = await pleskApi.createClient({
      name: user.name,
      email: user.email,
      login: user.email,
      password: user.password,
      type: ClientRequestTypeEnum.Customer,
      externalId: user.id,
      ownerLogin: "lucas.garrafielo",
      status: 0,
    });

    if (result && result.id) {
      await db
        .update(userTable)
        .set({
          pleskId: result.id,
        })
        .where(eq(userTable.id, user.id));
    } else {
      console.error("Failed to create Plesk client:", result);
      return {
        message: "Erro: ID do usuário Plesk não configurado.",
        error: "Configuração de usuário (Plesk ID) ausente.",
      };
    }
  }

  try {
    const result = await domApi.createRecurrentPayment({
      description: `Atlas Hosting ${plan.description}`,
      externalReference: invoiceId,
      frequency: "MONTH",
      card: {
        cvv: values.cardCvv,
        exp_month: +values.cardExpiration.split("/")[0],
        exp_year: +values.cardExpiration.split("/")[1],
        number: values.cardNumber.replace(/\D/g, ""),
        holder_name: values.fullName,
        holder_document: values.document.replace(/\D/g, ""),
      },
      userId: user.id,
      value: plan.price,
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
//         .update(userTable)
//         .set({
//           pleskId: result.id,
//         })
//         .where(eq(userTable.id, userId));

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
//         error:
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

//     const primaryIp = process.env.SERVER_IP!;

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

export async function getUserDomains(): Promise<{
  domains: { name: string }[];
  error?: string;
}> {
  try {
    // Assuming nameSilo.listDomains returns Promise<NamesiloReply<NamesiloDomain>>
    // where NamesiloReply<T> = { code: number; detail: string; } & T (NamesiloDomain in this case)
    const response = await nameSilo.listDomains({});

    // Check response code directly
    if (response.code !== 300) {
      // 300 is typical success for NameSilo listDomains
      return {
        domains: [],
        error: `Error fetching domains: ${response.detail} (Code: ${response.code})`,
      };
    }

    // Access domains directly from response (which is effectively NamesiloReply<NamesiloDomain>)
    // response.domains is of type (ListDomainDomain[] | { domain: ListDomainDomain } | undefined)
    const namesiloDomainData = response.domains;

    if (!namesiloDomainData) {
      // No domains found or the 'domains' part of the response is empty/undefined.
      return { domains: [] };
    }

    let domainList: ListDomainDomain[] = [];

    if (Array.isArray(namesiloDomainData)) {
      // Handles the case where 'domains' is an array of ListDomainDomain objects.
      domainList = namesiloDomainData;
    } else if (
      typeof namesiloDomainData === "object" &&
      namesiloDomainData !== null &&
      "domain" in namesiloDomainData
    ) {
      // Handles the case where 'domains' is an object like { domain: ListDomainDomain }.
      // We need to ensure namesiloDomainData.domain is not undefined or null.
      const singleDomainContainer = namesiloDomainData as {
        domain?: ListDomainDomain;
      };
      if (singleDomainContainer.domain) {
        domainList = [singleDomainContainer.domain];
      }
    }
    // If namesiloDomainData is neither an array nor the expected single domain object structure,
    // domainList will remain empty, resulting in an empty domain array being returned, which is safe.

    const domains = domainList.map((d) => ({ name: d.domain }));
    return { domains };
  } catch (e: unknown) {
    console.error("Failed to get user domains:", e);
    let message = "An unexpected error occurred while fetching domains.";
    if (e instanceof Error) {
      message = e.message;
    }
    return { domains: [], error: message };
  }
}

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
    const ids = instanceIds.split(",").map((id) => parseInt(id, 10));

    if (ids.some(isNaN)) {
      return { status: "error", message: "Invalid instance ID" };
    }

    // Delete all instances in parallel
    await Promise.all(
      ids.map(async (id) => {
        // TODO: delete DNS entries.
        await pleskApi.wordpress.uninstallWp(id);
      })
    );

    return { status: "success", message: "Sites excluídos com sucesso" };
  } catch (error) {
    console.error("Error deleting WordPress instances:", error);
    return { status: "error", message: "Erro ao excluir sites" };
  }
}
