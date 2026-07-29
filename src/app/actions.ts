"use server";

import type { LoginFormInputs } from "@/components/auth/LoginForm";
import type { CheckoutFormInputs } from "@/components/checkout/CheckoutForm";
import { getOptionalUser, getUser } from "@/lib/auth/index";
import {
  authenticateUser,
  createGuestUser,
  createSession,
  createUser,
  generateSessionToken,
  resignupUnverifiedUser,
} from "@/lib/auth/utils";

export async function checkIsLoggedIn(): Promise<boolean> {
  const user = await getOptionalUser();
  return !!user;
}

import axios from "axios";
import { query } from "dns-query";
import { and, eq, sql } from "drizzle-orm";
import ipaddrJs from "ipaddr.js";
import { isValidPhoneNumber } from "libphonenumber-js";
import { revalidatePath, revalidateTag } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { auth, signIn, signOut } from "@/auth";
import type { SavedCard } from "@/components/checkout/ModernCheckoutForm";
import { recordAttribution } from "@/lib/affiliate/attribution";
import { triggerCommissionIfApplicable } from "@/lib/affiliate/commission";
import { DEFAULT_POST_LOGIN_PATH } from "@/lib/consts/default-auth-path";
import { db } from "@/lib/db";
import {
  type DomainRegisterInvoiceOptions,
  type DomainRenewInvoiceOptions,
  type Invoice,
  type PixCheckoutSnapshot,
  type Plan,
  pgDomainPricingCache,
  pgInvoice,
  pgOrganization,
  pgOrganizationDomains,
  pgPlan,
  pgSession,
  pgUser,
  pgUserCard,
  pgVpsPaymentLink,
  pgVpsSubscription,
  type User,
} from "@/lib/db/schema";
import { sendNotificationEmail } from "@/lib/email/service";
import { triggerPurchaseNotifications } from "@/lib/notifications/vps-purchase";
import currencyConversion from "@/lib/server/apis/currency";
import domApi from "@/lib/server/apis/dom";
import ip2Location from "@/lib/server/apis/ip2location";
import namecheapApi, { getDomainPricing } from "@/lib/server/apis/namecheap";
import type { NamecheapContactDetails } from "@/lib/server/apis/namecheap/types";
import pleskApi from "@/lib/server/apis/plesk";
import simpayApi, {
  SimpayPaymentDeclinedError,
} from "@/lib/server/apis/simpay";
import { registerDomainsFromPaidInvoice } from "@/lib/server/domains/registerFromPaidInvoice";
import { renewDomainFromPaidInvoice } from "@/lib/server/domains/renewFromPaidInvoice";
import { AppLogger } from "@/lib/server/logs";
import { getServerPublicBaseUrl } from "@/lib/server/public-base-url";
import { getStorageVpsMonthlyEuro } from "@/lib/storage-vps-catalog";
import { isValidCNPJ, isValidCPF } from "@/lib/utils";
import { getVdsMonthlyEuro } from "@/lib/vds-catalog";
import { firstRenewalDate, nextRenewalDate } from "@/lib/vps/renewal-date";
import {
  CLOUD_VPS_LOCATION_EUR,
  CLOUD_VPS_STORAGE_UPGRADE_EUR,
  getCloudVpsMonthlyEuro,
  isCloudVpsPlanId,
  WINDOWS_SERVER_EUR,
} from "@/lib/vps-catalog";
import type { DomainPageParams } from "./(auth)/domain/types";

export interface GuestInfo {
  email: string;
  firstName: string;
  lastName: string;
  document: string;
  phoneNumber: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

async function findOrCreateGuestUser(info: GuestInfo) {
  const email = info.email.toLowerCase();
  const name = `${info.firstName} ${info.lastName}`;

  let user = await db.query.pgUser.findFirst({
    where: eq(pgUser.email, email),
    with: { organization: true },
  });

  let isNew = false;
  let passwordPlain = "";

  if (!user) {
    const guest = await createGuestUser(name, email, "Minha Organização");
    if (!guest.user) throw new Error("Erro ao criar usuário convidado.");

    passwordPlain = guest.passwordPlain || "";
    isNew = true;

    // Refetch to get organization
    user = (await db.query.pgUser.findFirst({
      where: eq(pgUser.id, guest.user.id),
      with: { organization: true },
    })) as any;
  }

  // Update billing info regardless if new or existing (as per user request: "apos preencher essas informacoes... vincule")
  if (user) {
    await db
      .update(pgUser)
      .set({
        billingCity: info.address.city,
        billingDocument: info.document.replace(/\D/g, ""),
        billingNeighborhood: info.address.neighborhood,
        billingNumber: info.address.number,
        billingPhone: info.phoneNumber.replace(/\D/g, ""),
        billingState: info.address.state,
        billingStreet: info.address.street,
        billingZipCode: info.address.zipCode.replace(/\D/g, ""),
        updatedAt: new Date(),
      })
      .where(eq(pgUser.id, user.id));
  }

  // Always create a session so subsequent payment actions work
  if (!user) throw new Error("Usuário não encontrado ou falha ao criar conta.");

  try {
    const cookieStore = await cookies();
    const refCode = cookieStore.get("referrer_code")?.value;
    if (refCode) {
      await recordAttribution(refCode, user.id);

      if (!user.referrerId) {
        const affiliate = await db.query.pgUser.findFirst({
          columns: { id: true },
          where: eq(pgUser.affiliateCode, refCode),
        });

        if (affiliate && affiliate.id !== user.id) {
          await db
            .update(pgUser)
            .set({ referrerId: affiliate.id, updatedAt: new Date() })
            .where(eq(pgUser.id, user.id));
        }
      }
    }
  } catch (error) {
    console.error(
      "[AFFILIATE] Failed to record guest checkout attribution:",
      error
    );
  }

  const sessionToken = generateSessionToken();
  await createSession(sessionToken, user.id);
  const cookieStore = await cookies();
  cookieStore.set("session_token", sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return { isNew, passwordPlain, user };
}

function paymentSuccessUrl(invoiceId: string): string {
  return `/payment/success?invoiceId=${encodeURIComponent(invoiceId)}`;
}

async function sendWelcomePasswordEmailIfGuest(invoice: Invoice, user: User) {
  const meta = invoice.metadata as any;
  if (meta?.guestPassword) {
    await sendNotificationEmail(
      user.email,
      user.name.split(" ")[0],
      "Atlas Hosting",
      "Sua conta foi criada!",
      `Olá! Sua compra foi confirmada e sua conta foi criada. Use a senha abaixo para acessar seu painel:\n\nSenha: ${meta.guestPassword}`,
      "success",
      `${getServerPublicBaseUrl()}/login`,
      "Acessar Painel"
    );
  }
}

export async function login(
  prevState: unknown,
  { email, password, redirectTo }: LoginFormInputs
): Promise<ActionResponse> {
  if (!email || !password) {
    return { message: "Email e senha são obrigatórios", status: "error" };
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
      return { message: "Email ou senha inválidos", status: "error" };
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return {
        error: "email_not_verified",
        message:
          "Você precisa verificar seu email antes de fazer login. Verifique sua caixa de entrada.",
        status: "error",
      };
    }

    const sessionToken = generateSessionToken();
    await createSession(sessionToken, user.id);

    const cookieStore = await cookies();

    cookieStore.set("session_token", sessionToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    // Attribution: record affiliate link click if cookie present
    try {
      const refCode = cookieStore.get("referrer_code")?.value;
      if (refCode) {
        await recordAttribution(refCode, user.id);
      }
    } catch {
      // Non-critical — don't fail login
    }

    revalidateTag("session-validate", "default");

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
      description,
      severity,
      title: "Novo login realizado",
      type: "security",
    });
  } catch (error) {
    console.error("Login error:", error);
    return { message: "Erro ao fazer login", status: "error" };
  }

  // Landing fica em `/`; painel autenticado em `/home` (evita conflito de rotas).
  let redirectPath = redirectTo?.startsWith("/")
    ? redirectTo
    : DEFAULT_POST_LOGIN_PATH;
  if (redirectPath === "/") {
    redirectPath = DEFAULT_POST_LOGIN_PATH;
  }
  redirect(redirectPath);
}

export async function signup(
  prevState: unknown,
  {
    email,
    password,
    firstName,
    lastName,
    referrerId: initialReferrerId,
    ref,
    organizationName,
  }: any
): Promise<ActionResponse> {
  // Garantir valores para campos que agora são omitidos no form
  const safeFirstName = firstName || email.split("@")[0];
  const safeLastName = lastName || "";
  const safeOrgName = organizationName || "Minha Organização";

  const fullName = `${safeFirstName.trim()} ${safeLastName.trim()}`.trim();

  let referrerId = initialReferrerId;

  if (ref && !referrerId) {
    const referringUser = await db.query.pgUser.findFirst({
      where: eq(pgUser.affiliateCode, ref),
    });
    if (referringUser) {
      referrerId = referringUser.id;
    }
  }

  if (!email || !password) {
    return {
      message: "Email e senha são obrigatórios",
      status: "error",
    };
  }

  if (password.length < 8) {
    return {
      message: "A senha deve ter pelo menos 8 caracteres",
      status: "error",
    };
  }
  if (password.length > 100) {
    return {
      message: "A senha deve ter no máximo 100 caracteres",
      status: "error",
    };
  }

  try {
    const existingUser = await db.query.pgUser.findFirst({
      where: eq(pgUser.email, email.toLowerCase()),
    });

    if (existingUser?.emailVerified) {
      return {
        message: "Erro ao criar conta. O email pode já estar em uso.",
        status: "error",
      };
    }

    // Se o usuário existe mas nunca verificou o email, reaproveita o registro
    // (mesma wallet/organization) em vez de bloquear ou duplicar dados.
    const user = existingUser
      ? await resignupUnverifiedUser(
          existingUser.id,
          fullName,
          email,
          password,
          safeOrgName
        )
      : await createUser(fullName, email, password, safeOrgName, referrerId);

    if (!user) {
      return {
        message: "Erro ao criar conta. O email pode já estar em uso.",
        status: "error",
      };
    }

    // Don't auto-login, let user verify email first
    if (referrerId && !existingUser) {
      try {
        const userLogger = new AppLogger({ id: referrerId });
        userLogger.log({
          description:
            "Um novo usuário se cadastrou usando seu link de afiliado.",
          severity: "success",
          title: "Usuário cadastrado com seu link de afiliado",
          type: "account",
        });
      } catch (error) {
        console.error("Failed to log affiliate:", error);
        // Don't fail signup if affiliate logging fails
      }
    }

    // Attribution: record affiliate referral from cookie or ref param
    try {
      const cookieStore = await cookies();
      const refCode = cookieStore.get("referrer_code")?.value || ref;
      if (refCode && user) {
        await recordAttribution(refCode, user.id);
      }
    } catch {
      // Non-critical
    }

    return {
      message:
        "Conta criada com sucesso! Verifique seu email para ativar a conta.",
      status: "success",
    };
  } catch (error) {
    console.error("Signup error:", error);
    return { message: "Erro ao criar conta", status: "error" };
  }
}

export async function logout(): Promise<void> {
  const a = await auth();
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  await signOut({
    redirect: true,
    redirectTo: "/login",
  });

  if (sessionToken) {
    await db.delete(pgSession).where(eq(pgSession.id, sessionToken));
    cookieStore.delete("session_token");
  }

  redirect("/");
}

export async function clearGuestCheckoutSession(
  invoiceId?: string
): Promise<void> {
  if (!invoiceId) return;

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;
  if (!sessionToken) return;

  const invoice = await db.query.pgInvoice.findFirst({
    columns: {
      metadata: true,
      userId: true,
    },
    where: eq(pgInvoice.id, invoiceId),
  });

  const meta = invoice?.metadata as Record<string, unknown> | null | undefined;
  if (!invoice || (!meta?.guestCheckout && !meta?.guestPassword)) return;

  const session = await db.query.pgSession.findFirst({
    columns: { userId: true },
    where: eq(pgSession.id, sessionToken),
  });

  if (session?.userId !== invoice.userId) return;

  await db.delete(pgSession).where(eq(pgSession.id, sessionToken));
  cookieStore.delete("session_token");
  revalidateTag("session-validate", "default");
}

export async function createPlan(
  prevState: unknown,
  input: Omit<Plan, "id" | "createdAt" | "updatedAt">
): Promise<ActionResponse> {
  try {
    const [plan] = await db // Destructure to get the first element
      .insert(pgPlan)
      .values({
        backup: input.backup,
        cdn: input.cdn,
        description: input.description,
        email: input.email,
        featured: input.featured,
        maxSites: input.maxSites,
        maxStorage: input.maxStorage,
        name: input.name,
        price: input.price,
        ssl: input.ssl,
        supportPriority: input.supportPriority,
      })
      .returning();

    revalidatePath("/admin/plans");
    return {
      message: "Plano criado com sucesso",
      status: "success",
    };
  } catch (error) {
    console.error("Create plan error:", error);
    return { message: "Erro ao criar plano", status: "error" };
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
        message: "Plano não encontrado para atualização.",
        status: "error",
      };
    }

    revalidatePath("/admin/plans");
    revalidatePath(`/admin/plans/${id}/edit`);

    return {
      message: "Plano atualizado com sucesso",
      status: "success",
    };
  } catch (error) {
    console.error("Update plan error:", error);
    return { message: "Erro ao atualizar plano", status: "error" };
  }
}

export async function createPlanInvoice(
  planId: string
): Promise<ActionResponse> {
  const user = await getUser();

  if (!user) {
    return {
      message: "Usuário não autenticado. Faça login para continuar.",
      status: "error",
    };
  }

  if (!planId) {
    return { message: "ID do plano é obrigatório.", status: "error" };
  }

  let redirectUrl: string | null = null;

  try {
    const plan = await db.query.pgPlan.findFirst({
      where: eq(pgPlan.id, planId),
    });

    if (!plan) {
      return { message: "Plano não encontrado.", status: "error" };
    }

    const planPrice = plan.price;

    const [newInvoice] = await db
      .insert(pgInvoice)
      .values({
        amount: planPrice,
        currency: "BRL",
        description: `ATLAS Fatura plano ${plan.name}`,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Pass Date object directly
        orgId: user.organization.id,
        reference: plan.id,
        status: "pending",
        type: "subscription",
        userId: user.id,
      })
      .returning();

    if (!newInvoice?.id) {
      console.error(
        "Falha ao criar a fatura ou obter o ID de retorno do banco de dados.",
        newInvoice
      );
      return {
        message: "Erro ao criar fatura. Tente novamente.",
        status: "error",
      };
    }

    redirectUrl = `/checkout/${newInvoice.id}`;
  } catch (error) {
    console.error("Erro ao criar fatura do plano:", error);
    return {
      message:
        "Erro interno ao processar o pedido. Por favor, tente mais tarde.",
      status: "error",
    };
  }

  if (redirectUrl) {
    return {
      message: redirectUrl,
      status: "success",
    };
  }

  return {
    message: "Erro ao processar o pedido. Por favor, tente mais tarde.",
    status: "error",
  };
}

/** Helper to calculate the domain profit fee (markup) */
const getDomainProfitFee = async (): Promise<number> => {
  const feeEnabled = process.env.DOMAIN_FEE_ENABLED !== "false";
  if (!feeEnabled) return 1;

  try {
    const envFeeValue =
      process.env.DOMAIN_PROFIT_FEE || process.env.NAMESILO_PROFIT_FEE;
    const envFee = envFeeValue ? Number.parseFloat(envFeeValue) : undefined;

    let finalFeePercent: number;

    if (envFee !== undefined) {
      // Normalize: 0.2 -> 20, 1.2 -> 20, 20 -> 20
      if (envFee > 0 && envFee < 1) {
        finalFeePercent = envFee * 100;
      } else if (envFee >= 1 && envFee < 5) {
        finalFeePercent = (envFee - 1) * 100;
      } else {
        finalFeePercent = envFee;
      }
    } else {
      const dbConfig = await db.query.pgSystemConfig.findFirst();
      finalFeePercent = dbConfig?.domainFee ?? 30;
    }

    return 1 + finalFeePercent / 100;
  } catch {
    return 1.2;
  }
};

export async function createDomainInvoice(
  data: (DomainPageParams & { guestInfo?: GuestInfo }) | FormData
) {
  "use server";

  let domain: string | undefined;
  let years: string | undefined;
  let whoisguard: string | undefined;
  let guestInfo: GuestInfo | undefined;

  if (data instanceof FormData) {
    domain = data.get("domain") as string;
    years = data.get("years") as string;
    whoisguard = data.get("whoisguard") as string;
  } else {
    domain = data.domain;
    years = data.years;
    whoisguard = data.whoisguard;
    guestInfo = data.guestInfo;
  }

  let user = await getUser();
  const isGuestCheckout = !user && !!guestInfo;
  let guestPassword = "";

  if (!user) {
    if (guestInfo) {
      const guest = await findOrCreateGuestUser(guestInfo);
      user = guest.user as any;
      guestPassword = guest.passwordPlain || "";
    } else {
      return { error: "Usuário não autenticado." };
    }
  }

  if (!user) {
    return { error: "Usuário não encontrado." };
  }

  if (!domain) {
    return { error: "Domínio não informado." };
  }

  const yearStr = years && years.trim() !== "" ? years : "1";

  console.log(
    "\n[INVOICE] ==================== CRIANDO FATURA DE DOMÍNIO ===================="
  );
  console.log(
    `[INVOICE] Domínio: ${domain} | Anos: ${yearStr} | Whoisguard: ${whoisguard ?? "off"} | Usuário: ${user.id}`
  );

  try {
    console.log(`[NAMECHEAP] Verificando disponibilidade de: ${domain}`);
    const namecheapResult = await namecheapApi
      .check({
        DomainList: domain,
      })
      .then(r => r.Results[0]);

    console.log("[NAMECHEAP] Resultado da verificação:", {
      available: namecheapResult.Available,
      domain: namecheapResult.Domain,
      isPremium: namecheapResult.IsPremiumName,
      premiumPrice: namecheapResult.PremiumRegistrationPrice || "N/A",
    });

    const isAvailable = namecheapResult.Available;

    if (!isAvailable) {
      console.warn(
        `[INVOICE] Domínio ${domain} não está disponível. Fatura não criada.`
      );
      return { error: "Domínio não está disponível para registro." };
    }

    const fee = await getDomainProfitFee();

    let priceInBrl = 0;
    let namecheapCostBrl = 0;

    // Se for premium, usamos o preço premium retornado no check
    if (
      namecheapResult.IsPremiumName &&
      (namecheapResult.PremiumRegistrationPrice ?? 0) > 0
    ) {
      const basePriceUSD = namecheapResult.PremiumRegistrationPrice ?? 0;
      console.log(`[INVOICE] Usando PREÇO PREMIUM: $${basePriceUSD}`);
      const baseUsdAsBrl = await currencyConversion.convert({
        amount: basePriceUSD,
        from: "usd",
        to: "brl",
      });
      const targetYears = Number.parseInt(yearStr, 10);
      const fixedFee = Number(process.env.DOMAIN_FIXED_FEE) || 4;
      namecheapCostBrl = baseUsdAsBrl * targetYears;
      priceInBrl = baseUsdAsBrl * fee + fixedFee * targetYears;
    } else {
      const tld = domain.split(".").pop() as string;
      console.log(`[NAMECHEAP] Buscando preços para TLD: .${tld}`);

      // Buscamos o preço de 1 ano e o de renovação
      const pricing = await db.query.pgDomainPricingCache.findFirst({
        where: eq(pgDomainPricingCache.tld, tld),
      });

      let p1USD = 0;
      let renewUSD = 0;
      const allPricesUSD: Record<number, number> = {};

      if (pricing) {
        p1USD = pricing.price ?? 0;
        renewUSD = pricing.renew ?? p1USD * 1.1;
      } else {
        const pricingData = await namecheapApi.getPricing(tld);
        const categories = pricingData?.ProductType?.Categories || [];

        const regCat = categories.find(
          c => c.Name.toUpperCase() === "REGISTER"
        );
        const renewCat = categories.find(c => c.Name.toUpperCase() === "RENEW");

        const products = regCat?.Products || [];
        const prod = products.find(
          (p: any) => p.Name.toLowerCase() === tld.toLowerCase()
        );

        if (prod) {
          prod.Prices.forEach((p: any) => {
            if (
              p.DurationType === "YEAR" &&
              p.Duration >= 1 &&
              p.Duration <= 10
            ) {
              allPricesUSD[p.Duration] = p.YourPrice ?? p.Price ?? 0;
            }
          });
        }

        p1USD = allPricesUSD[1] || 0;

        const get1YearPrice = (cat: any) => {
          const products = cat?.Products || [];
          const prod = products.find(
            (p: any) => p.Name.toLowerCase() === tld.toLowerCase()
          );
          const priceDetail = prod?.Prices.find(
            (p: any) => p.Duration === 1 && p.DurationType === "YEAR"
          );
          return priceDetail?.YourPrice ?? priceDetail?.Price ?? 0;
        };
        renewUSD = get1YearPrice(renewCat) || p1USD * 1.2;
      }

      // Cálculo final baseado na tabela ou na renovação
      const targetYears = Number.parseInt(yearStr, 10);
      let totalUSD = 0;

      if (allPricesUSD[targetYears]) {
        totalUSD = allPricesUSD[targetYears];
      } else {
        totalUSD = p1USD + renewUSD * (targetYears - 1);
      }

      const baseUsdAsBrl = await currencyConversion.convert({
        amount: totalUSD,
        from: "usd",
        to: "brl",
      });
      const envFixedFee = process.env.DOMAIN_FIXED_FEE;
      const fixedFee = envFixedFee !== undefined ? Number(envFixedFee) : 4;
      namecheapCostBrl = baseUsdAsBrl;
      priceInBrl = baseUsdAsBrl * fee + fixedFee * targetYears;
    }

    if (whoisguard === "on") {
      // Whoisguard sem custo
    }

    const [newInvoice] = await db
      .insert(pgInvoice)
      .values({
        amount: priceInBrl,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        metadata: {
          guestCheckout: isGuestCheckout || undefined,
          guestPassword: guestPassword || undefined,
          namecheapCostBrl: namecheapCostBrl > 0 ? namecheapCostBrl : undefined,
          whoisguard,
          years: yearStr,
        },
        orgId: user.organization.id,
        reference: domain,
        status: "pending",
        type: "domain",
        userId: user.id,
      })
      .returning();

    if (!newInvoice?.id) {
      console.error(
        "[INVOICE] Falha ao criar fatura no banco de dados.",
        newInvoice
      );
      return { error: "Erro ao criar fatura no banco de dados." };
    }

    console.log(
      `[INVOICE] Fatura criada com sucesso! ID: ${newInvoice.id} | Valor: R$ ${priceInBrl.toFixed(2)}`
    );
    return {
      invoiceId: newInvoice.id,
      redirectUrl: `/checkout/${newInvoice.id}`,
      status: "success",
    };
  } catch (error) {
    console.error("[INVOICE] ERRO ao criar fatura do domínio:", error);
    return { error: "Erro interno ao processar o pedido." };
  }
}

/** Pacote só pela URL “Amplie sua marca” (2–5 domínios), uma fatura e registro múltiplo após pagamento. */
export async function createDomainBundleInvoice({
  domains,
  years = "1",
  whoisguard,
}: {
  domains: string[];
  years?: string;
  whoisguard?: string;
}) {
  "use server";

  const user = await getUser();
  if (!user) {
    return;
  }

  const yearStr = years ?? "1";
  const list = [
    ...new Set(
      domains.map(d => d.trim().toLowerCase()).filter(d => d.includes("."))
    ),
  ].slice(0, 5);

  if (list.length < 2) {
    console.warn("[INVOICE-PACOTE] Menos de 2 domínios válidos.");
    return;
  }

  let redirectUrl: string | null = null;

  try {
    let totalBrl = 0;
    const feeEnabled = process.env.DOMAIN_FEE_ENABLED !== "false";
    let fee = 1;
    if (feeEnabled) {
      try {
        const envFeeValue =
          process.env.DOMAIN_PROFIT_FEE || process.env.NAMESILO_PROFIT_FEE;
        const envFee = envFeeValue ? Number.parseFloat(envFeeValue) : undefined;
        const envFeeNormalized =
          envFee !== undefined
            ? envFee > 0 && envFee < 1
              ? envFee * 100
              : envFee
            : undefined;

        const config = await db.query.pgSystemConfig.findFirst();
        const finalFeePercent = envFeeNormalized ?? config?.domainFee ?? 30;
        fee = 1 + finalFeePercent / 100;
      } catch {
        fee = 1.2;
      }
    }

    for (const domain of list) {
      const namecheapResult = await namecheapApi
        .check({ DomainList: domain })
        .then(r => r.Results[0]);

      if (
        !namecheapResult?.Available &&
        !(
          namecheapResult?.IsPremiumName &&
          (namecheapResult?.PremiumRegistrationPrice ?? 0) > 0
        )
      ) {
        console.warn(`[INVOICE-PACOTE] Domínio indisponível: ${domain}`);
        return;
      }

      let priceUSD = 0;
      if (
        namecheapResult.IsPremiumName &&
        (namecheapResult.PremiumRegistrationPrice ?? 0) > 0
      ) {
        priceUSD = namecheapResult.PremiumRegistrationPrice ?? 0;
      } else {
        const pricesInfo = await getDomainPricing(
          domain.split(".").pop() as string
        );
        const priceInfo = pricesInfo?.Prices.find(
          (p: any) => p.Duration === +yearStr && p.DurationType === "YEAR"
        );

        if (!priceInfo) {
          console.error(
            `[INVOICE-PACOTE] Sem preço para ${domain} (${yearStr}a).`
          );
          return;
        }
        priceUSD = priceInfo.Price;
      }

      const priceInBrl = await currencyConversion.convert({
        amount: priceUSD,
        from: "usd",
        to: "brl",
      });
      const envFixedFee = process.env.DOMAIN_FIXED_FEE;
      const fixedFee =
        envFixedFee !== undefined ? Number.parseFloat(envFixedFee) : 4;
      totalBrl += priceInBrl * fee + fixedFee;
    }

    const wgOn = whoisguard === "on";

    const refLabel =
      list.length <= 3
        ? `Pacote: ${list.join(" · ")}`
        : `Pacote (${list.length} domínios)`;

    const [newInvoice] = await db
      .insert(pgInvoice)
      .values({
        amount: totalBrl,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        metadata: {
          bundleDomains: list,
          whoisguard: wgOn ? "on" : "off",
          years: yearStr,
        },
        orgId: user.organization.id,
        reference: refLabel.slice(0, 280),
        status: "pending",
        type: "domain",
        userId: user.id,
      })
      .returning();

    if (!newInvoice?.id) {
      console.error("[INVOICE-PACOTE] Falha ao gravar fatura.");
      return;
    }

    redirectUrl = `/checkout/${newInvoice.id}`;
    console.log(
      `[INVOICE-PACOTE] Fatura ${newInvoice.id} | R$ ${totalBrl.toFixed(2)} | ${list.join(", ")}`
    );
    return { invoiceId: newInvoice.id, redirectUrl, status: "success" };
  } catch (error) {
    console.error("[INVOICE-PACOTE] ERRO:", error);
    return { error: "Erro ao criar fatura do pacote." };
  }
}

export async function createDomainRenewalInvoice(
  domainName: string
): Promise<
  | { status: "error"; message: string }
  | { status: "success"; invoiceId: string; priceBRL: number }
> {
  const user = await getUser();
  if (!user) return { message: "Usuário não autenticado.", status: "error" };

  const tld = domainName.split(".").slice(1).join(".");
  const pricing = await db.query.pgDomainPricingCache.findFirst({
    where: eq(pgDomainPricingCache.tld, tld),
  });

  let renewUSD = pricing?.renew;

  if (!renewUSD) {
    console.log(
      `[RENEWAL] Preço não encontrado no cache para .${tld}. Buscando na Namecheap API...`
    );
    try {
      const pricingData = await namecheapApi.getPricing(tld);
      const categories = pricingData?.ProductType?.Categories || [];
      const renewCat = categories.find(c => c.Name.toUpperCase() === "RENEW");
      const products = renewCat?.Products || [];
      const prod = products.find(
        (p: any) => p.Name.toLowerCase() === tld.toLowerCase()
      );

      if (prod) {
        const priceDetail = prod.Prices.find(
          (p: any) => p.Duration === 1 && p.DurationType === "YEAR"
        );
        renewUSD = priceDetail?.YourPrice ?? priceDetail?.Price;
      }

      if (!renewUSD) {
        // Fallback para o preço de registro + 20% se renovação não for encontrada
        const regCat = categories.find(
          c => c.Name.toUpperCase() === "REGISTER"
        );
        const regProd = regCat?.Products.find(
          (p: any) => p.Name.toLowerCase() === tld.toLowerCase()
        );
        const regPriceDetail = regProd?.Prices.find(
          (p: any) => p.Duration === 1 && p.DurationType === "YEAR"
        );
        const regPrice = regPriceDetail?.YourPrice ?? regPriceDetail?.Price;
        if (regPrice) {
          renewUSD = regPrice * 1.2;
        }
      }
    } catch (error) {
      console.error("[RENEWAL] Erro ao buscar preço na Namecheap:", error);
    }
  }

  if (!renewUSD) {
    return {
      message: "Preço de renovação não encontrado para este domínio.",
      status: "error",
    };
  }

  const fee = await getDomainProfitFee();
  const fixedFee = Number.parseFloat(process.env.DOMAIN_FIXED_FEE || "4");

  const baseBrl = await currencyConversion.convert({
    amount: renewUSD,
    from: "usd",
    to: "brl",
  });
  const amountBRL = Math.ceil((baseBrl * fee + fixedFee) * 100) / 100;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 1);

  const [newInvoice] = await db
    .insert(pgInvoice)
    .values({
      amount: amountBRL,
      dueDate,
      metadata: {
        domain: domainName,
        type: "renew",
      } as unknown as DomainRenewInvoiceOptions,
      orgId: user.organization.id,
      reference: domainName,
      status: "pending",
      type: "domain",
      userId: user.id,
    })
    .returning();

  if (!newInvoice?.id)
    return { message: "Erro ao criar fatura de renovação.", status: "error" };

  return {
    invoiceId: newInvoice.id,
    priceBRL: Math.round(amountBRL * 100),
    status: "success",
  };
}

const TEST_PAYMENT_AMOUNT_BRL = 1;

/**
 * Texto de conciliação na Simpay (PIX e cartão): "atlas " + reference da fatura.
 * Fatura teste R$1 usa o mesmo padrão; muda só amount e reference.
 */
function atlasSimpayInvoiceDescription(reference: string): string {
  return `atlas ${reference.trim()}`;
}

/**
 * Fatura tipo "domínio" com R$ 1,00 para testar PIX e cartão de verdade (Simpay/DOM).
 * Não registra domínio na Namecheap (metadata.testPaymentOnly).
 *
 * Ativo se NODE_ENV=development ou ALLOW_TEST_PAYMENT_INVOICE=true
 */
export async function createTestPaymentInvoice(): Promise<
  { ok: false; message: string } | { ok: true; invoiceId: string }
> {
  "use server";

  const allowed =
    process.env.NODE_ENV === "development" ||
    process.env.ALLOW_TEST_PAYMENT_INVOICE === "true";

  if (!allowed) {
    return {
      message:
        "Fatura de teste desativada (defina ALLOW_TEST_PAYMENT_INVOICE=true ou use ambiente de desenvolvimento).",
      ok: false,
    };
  }

  const user = await getUser();
  if (!user) {
    return { message: "Faça login para continuar.", ok: false };
  }

  const reference = `teste-pagamento-${Date.now()}`;

  const [newInvoice] = await db
    .insert(pgInvoice)
    .values({
      amount: TEST_PAYMENT_AMOUNT_BRL,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      metadata: {
        testPaymentOnly: true,
        whoisguard: "off",
        years: "1",
      },
      orgId: user.organization.id,
      reference,
      status: "pending",
      type: "domain",
      userId: user.id,
    })
    .returning();

  if (!newInvoice?.id) {
    return { message: "Não foi possível criar a fatura.", ok: false };
  }

  console.log(
    `[TEST-PAYMENT] Fatura de teste criada: ${newInvoice.id} | R$ ${TEST_PAYMENT_AMOUNT_BRL} | ref=${reference}`
  );

  return { invoiceId: newInvoice.id, ok: true };
}

type PixSnapResult =
  | { ok: true; billing: PixCheckoutSnapshot }
  | { ok: false; message: string };

function buildPixCheckoutSnapshot(
  input: InitiateCheckoutPixPayload
): PixSnapResult {
  const doc = input.document.replace(/\D/g, "");
  if (!isValidCPF(doc) && !isValidCNPJ(doc)) {
    return { message: "Documento inválido.", ok: false };
  }
  if (!isValidPhoneNumber(`55${input.phoneNumber.replace(/\D/g, "")}`, "BR")) {
    return { message: "Telefone inválido.", ok: false };
  }
  const z = input.address.zipCode.replace(/\D/g, "");
  if (z.length !== 8) {
    return { message: "CEP inválido.", ok: false };
  }
  return {
    billing: {
      address: {
        city: input.address.city.trim(),
        neighborhood: input.address.neighborhood.trim(),
        number: input.address.number.trim(),
        state: input.address.state.trim().toUpperCase().slice(0, 2),
        street: input.address.street.trim(),
        zipCode: z,
      },
      document: input.document,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phoneNumber: input.phoneNumber,
    },
    ok: true,
  };
}

async function processInvoiceAfterPayment(
  invoice: Invoice,
  user: User,
  billing: PixCheckoutSnapshot
): Promise<void> {
  if (invoice.type !== "domain") return;

  const meta = invoice.metadata as DomainRegisterInvoiceOptions;
  if (meta.testPaymentOnly) return;

  const domainMeta = invoice.metadata as
    | DomainRegisterInvoiceOptions
    | DomainRenewInvoiceOptions;
  if ((domainMeta as DomainRenewInvoiceOptions).type === "renew") {
    await renewDomainFromPaidInvoice(invoice);
    return;
  }

  const contact = {
    Address1: `${billing.address.street}, ${billing.address.number}`,
    City: billing.address.city,
    Country: "BR",
    EmailAddress: user.email,
    FirstName: billing.firstName.trim(),
    LastName: billing.lastName.trim(),
    Phone: `+55.${billing.phoneNumber.replace(/\D/g, "")}`,
    PostalCode: billing.address.zipCode,
    StateProvince: billing.address.state,
  };

  await registerDomainsFromPaidInvoice(
    invoice,
    contact as NamecheapContactDetails
  );
  await sendWelcomePasswordEmailIfGuest(invoice, user);
}

async function fulfillCheckoutAfterPixPaid(
  invoice: Invoice,
  user: User,
  billing: PixCheckoutSnapshot
): Promise<void> {
  const meta = invoice.metadata as DomainRegisterInvoiceOptions;

  if (invoice.type === "domain") {
    if (meta.testPaymentOnly) {
      await db
        .update(pgInvoice)
        .set({ status: "paid" })
        .where(eq(pgInvoice.id, invoice.id));
      console.log(
        `[CHECKOUT-PIX] Fatura de teste paga (sem Namecheap): ${invoice.id}`
      );
      redirect(paymentSuccessUrl(invoice.id));
    }

    const domainMeta = invoice.metadata as
      | DomainRegisterInvoiceOptions
      | DomainRenewInvoiceOptions;

    if ((domainMeta as DomainRenewInvoiceOptions).type === "renew") {
      const { renewed } = await renewDomainFromPaidInvoice(invoice);
      if (!renewed) {
        console.error(
          `[CHECKOUT-PIX] Falha ao renovar domínio para fatura ${invoice.id}`
        );
      }
      await db
        .update(pgInvoice)
        .set({ status: "paid" })
        .where(eq(pgInvoice.id, invoice.id));
      redirect(paymentSuccessUrl(invoice.id));
    }

    const contact = {
      Address1: `${billing.address.street}, ${billing.address.number}`,
      City: billing.address.city,
      Country: "BR",
      EmailAddress: user.email,
      FirstName: billing.firstName.trim(),
      LastName: billing.lastName.trim(),
      Phone: `+55.${billing.phoneNumber.replace(/\D/g, "")}`,
      PostalCode: billing.address.zipCode,
      StateProvince: billing.address.state,
    };
    const { registered, failed } = await registerDomainsFromPaidInvoice(
      invoice,
      contact as NamecheapContactDetails
    );
    if (failed.length) {
      console.error("[CHECKOUT-PIX] Falha ao registrar domínio(s):", failed);
    }
    if (registered.length === 0) {
      console.error(
        `[CHECKOUT-PIX] Nenhum domínio registrado para fatura ${invoice.id}`
      );
    }

    await db
      .update(pgInvoice)
      .set({ status: "paid" })
      .where(eq(pgInvoice.id, invoice.id));
    redirect(paymentSuccessUrl(invoice.id));
  }

  // Generic (non-domain) invoice — mark as paid
  await db
    .update(pgInvoice)
    .set({ status: "paid" })
    .where(eq(pgInvoice.id, invoice.id));

  // Notifications (WhatsApp + email) via Unified Helper
  after(async () => {
    await triggerPurchaseNotifications(
      invoice,
      user,
      billing ? { ...billing, paymentMethod: "pix" } : billing
    );
  });

  redirect(paymentSuccessUrl(invoice.id));
}

export interface InitiateCheckoutPixPayload {
  invoiceId: string;
  firstName: string;
  lastName: string;
  document: string;
  phoneNumber: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export async function initiateCheckoutPix(
  payload: InitiateCheckoutPixPayload
): Promise<
  | { status: "error"; message: string }
  | {
      status: "success";
      pix_qrcode: string;
      pix_content: string;
      paymentId: string;
      transactionId: string;
    }
> {
  const user = await getUser();
  const snap = buildPixCheckoutSnapshot(payload);
  if (!snap.ok) {
    return { message: snap.message, status: "error" };
  }
  const billing = snap.billing;

  const invoice = await db.query.pgInvoice.findFirst({
    where: eq(pgInvoice.id, payload.invoiceId),
  });

  if (!invoice || invoice.orgId !== user.organization.id) {
    return { message: "Fatura não encontrada.", status: "error" };
  }

  if (invoice.status === "paid") {
    return { message: "Esta fatura já foi paga.", status: "error" };
  }

  if (invoice.type === "vps") {
    const meta = invoice.metadata as any;
    if (!(await isPixEligibleForVpsConfig(meta?.config || {}))) {
      return {
        message: "PIX não disponível para esta cobrança.",
        status: "error",
      };
    }
  }

  const docDigits = billing.document.replace(/\D/g, "");

  try {
    const pixRes = await simpayApi.createPixPayment({
      description: atlasSimpayInvoiceDescription(invoice.reference),
      document: docDigits,
      document_type: docDigits.length === 11 ? "CPF" : "CNPJ",
      email: user.email,
      mobile_phone: billing.phoneNumber.replace(/\D/g, ""),
      name: `${billing.firstName} ${billing.lastName}`.trim(),
      price: invoice.amount,
    });

    const paymentId = pixRes.paymentId ?? pixRes.id ?? "";
    if (!paymentId) {
      return { message: "Resposta PIX sem identificador.", status: "error" };
    }

    const mergedMeta: DomainRegisterInvoiceOptions = {
      ...(invoice.metadata as DomainRegisterInvoiceOptions),
      pixCheckout: billing,
      pixTransactionId: pixRes.transactionId ?? "",
      simpayPaymentId: paymentId,
    };

    await db
      .update(pgInvoice)
      .set({
        metadata: mergedMeta,
        status: "pending",
      })
      .where(eq(pgInvoice.id, invoice.id));

    return {
      paymentId,
      pix_content: pixRes.pix_content,
      pix_qrcode: pixRes.pix_qrcode,
      status: "success",
      transactionId: pixRes.transactionId ?? "",
    };
  } catch (err) {
    console.error("[CHECKOUT-PIX] initiate:", err);
    return {
      message:
        "Não foi possível gerar o PIX no momento. Tente novamente em instantes.",
      status: "error",
    };
  }
}

export type InitiateCheckoutBoletoPayload = InitiateCheckoutPixPayload;

/** Taxa extra cobrada em cima do valor da fatura quando o pagamento é via boleto. Configurável via env BOLETO_FEE. */
const BOLETO_FEE = Number(process.env.BOLETO_FEE ?? 7);

/**
 * Gera um boleto via DOM Pagamentos (API de transação avulsa, /transactions —
 * distinta da Simpay usada pra cartão/PIX). Boleto não é liberado por padrão;
 * ver isBoletoEligibleForVpsConfig.
 */
export async function initiateCheckoutBoleto(
  payload: InitiateCheckoutBoletoPayload
): Promise<
  | { status: "error"; message: string }
  | {
      status: "success";
      boletoUrl: string;
      boletoDigitableLine: string;
      transactionId: string;
    }
> {
  const user = await getUser();
  const snap = buildPixCheckoutSnapshot(payload);
  if (!snap.ok) {
    return { message: snap.message, status: "error" };
  }
  const billing = snap.billing;

  const invoice = await db.query.pgInvoice.findFirst({
    where: eq(pgInvoice.id, payload.invoiceId),
  });

  if (!invoice || invoice.orgId !== user.organization.id) {
    return { message: "Fatura não encontrada.", status: "error" };
  }

  if (invoice.status === "paid") {
    return { message: "Esta fatura já foi paga.", status: "error" };
  }

  if (invoice.type === "vps") {
    const meta = invoice.metadata as any;
    if (!(await isBoletoEligibleForVpsConfig(meta?.config || {}))) {
      return {
        message: "Boleto não disponível para esta cobrança.",
        status: "error",
      };
    }
  } else if (!(await isBoletoEnabledGlobally())) {
    return { message: "Boleto não disponível no momento.", status: "error" };
  }

  const docDigits = billing.document.replace(/\D/g, "");
  const zipDigits = billing.address.zipCode.replace(/\D/g, "");

  try {
    const tx = await domApi.createBoletoTransaction({
      codExternal: invoice.id,
      customer: {
        address: {
          city: billing.address.city,
          neighborhood: billing.address.neighborhood,
          number: billing.address.number,
          state: billing.address.state,
          street: billing.address.street,
          uf: billing.address.state,
          zip_code: zipDigits,
        },
        document: docDigits,
        document_type: docDigits.length === 11 ? "CPF" : "CNPJ",
        email: user.email,
        mobile_phone: billing.phoneNumber.replace(/\D/g, ""),
        name: `${billing.firstName} ${billing.lastName}`.trim(),
      },
      description: atlasSimpayInvoiceDescription(invoice.reference),
      value: invoice.amount + BOLETO_FEE,
    });

    if (!tx.boleto_url || !tx.boleto_digitable_line) {
      return {
        message: "Boleto criado sem os dados de pagamento. Tente novamente.",
        status: "error",
      };
    }

    const mergedMeta: DomainRegisterInvoiceOptions = {
      ...(invoice.metadata as DomainRegisterInvoiceOptions),
      boletoDigitableLine: tx.boleto_digitable_line,
      boletoUrl: tx.boleto_url,
      domTransactionId: tx.id,
      pixCheckout: billing, // reaproveita o mesmo snapshot de cobrança do PIX
    } as any;

    await db
      .update(pgInvoice)
      .set({ metadata: mergedMeta, status: "pending" })
      .where(eq(pgInvoice.id, invoice.id));

    return {
      boletoDigitableLine: tx.boleto_digitable_line,
      boletoUrl: tx.boleto_url,
      status: "success",
      transactionId: tx.id,
    };
  } catch (err) {
    console.error("[CHECKOUT-BOLETO] initiate:", err);
    return {
      message:
        "Não foi possível gerar o boleto no momento. Tente novamente em instantes.",
      status: "error",
    };
  }
}

/** Polling do status do boleto (DOM). Quando "paid", marca como pago e processa em background. */
export async function syncCheckoutBoletoPayment(
  invoiceId: string
): Promise<{ status: "PENDING" | "COMPLETED" }> {
  let user = await getOptionalUser();

  const invoice = await db.query.pgInvoice.findFirst({
    where: eq(pgInvoice.id, invoiceId),
    with: { user: { with: { organization: true } } },
  });

  if (!invoice) return { status: "PENDING" };

  if (!user) {
    user = invoice.user as any;
  }

  if (!user || invoice.orgId !== user.organization.id) {
    return { status: "PENDING" };
  }

  if (invoice.status === "paid") {
    return { status: "COMPLETED" };
  }

  const meta = invoice.metadata as any;
  const transactionId = meta?.domTransactionId;
  const billing = meta?.pixCheckout;

  if (!transactionId || !billing) {
    return { status: "PENDING" };
  }

  try {
    const tx = await domApi.getTransaction(transactionId);
    if (tx.status !== "paid") {
      return { status: "PENDING" };
    }
  } catch (err) {
    console.error("[CHECKOUT-BOLETO] sync:", err);
    return { status: "PENDING" };
  }

  await db
    .update(pgInvoice)
    .set({ status: "paid" })
    .where(eq(pgInvoice.id, invoice.id));

  after(async () => {
    await triggerCommissionIfApplicable(invoice as any).catch(() => {});
    await processInvoiceAfterPayment(invoice, user, billing);
    await handleVpsNonCardPaid(invoice as Invoice, user, "boleto");
    await triggerPurchaseNotifications(invoice, user, {
      ...billing,
      paymentMethod: "boleto",
    });
  });

  return { status: "COMPLETED" };
}

/**
 * Consulta a Simpay para saber se o pagamento PIX foi realmente concluído.
 * Fonte da verdade do gateway — nunca confiar apenas no cliente/SSE.
 */
async function verifySimpayPixCompleted(paymentId: string): Promise<boolean> {
  const simApi = (process.env.SIMPAY_API_URL ?? "").replace(/\/+$/, "");

  if (simApi) {
    try {
      const directRes = await fetch(
        `${simApi}/atlas/payments/pix-status/${paymentId}`
      );
      if (directRes.ok) {
        const directData = (await directRes.json()) as { status?: string };
        if (
          directData.status === "COMPLETED" ||
          directData.status === "PAID" ||
          directData.status === "APPROVED"
        ) {
          return true;
        }
      }
    } catch {
      /* fall through to getPaymentStatus */
    }
  }

  try {
    const remote = await simpayApi.getPaymentStatus(paymentId);
    if (remote.status === "COMPLETED") return true;
  } catch (err) {
    console.error(
      `[CHECKOUT-PIX] Falha ao verificar status do pagamento ${paymentId}:`,
      err
    );
  }

  return false;
}

/**
 * Chamado pelo cliente quando SSE confirma o pagamento.
 * VERIFICA o status na Simpay (o evento SSE vem do navegador e não é confiável
 * como prova de pagamento) e só então marca a fatura como paga.
 */
export async function markPixPaymentComplete(
  invoiceId: string
): Promise<{ confirmed: boolean }> {
  let user = await getUser();

  const invoice = await db.query.pgInvoice.findFirst({
    where: eq(pgInvoice.id, invoiceId),
    with: { user: { with: { organization: true } } },
  });

  if (!invoice) return { confirmed: false };

  // Fallback to invoice user if no session (guest checkout for existing user)
  if (!user) {
    user = invoice.user as any;
  }

  if (!user || invoice.orgId !== user.organization.id)
    return { confirmed: false };
  if (invoice.status === "paid") return { confirmed: true };

  const meta = invoice.metadata as DomainRegisterInvoiceOptions;
  const paymentId = meta.simpayPaymentId;

  if (!paymentId) {
    console.warn(
      `[CHECKOUT-PIX] Fatura ${invoiceId} sem simpayPaymentId — pagamento não confirmado.`
    );
    return { confirmed: false };
  }

  const completed = await verifySimpayPixCompleted(paymentId);
  if (!completed) {
    console.warn(
      `[CHECKOUT-PIX] SSE indicou pagamento da fatura ${invoiceId}, mas a Simpay NÃO confirmou. Fatura permanece pendente.`
    );
    return { confirmed: false };
  }

  await db
    .update(pgInvoice)
    .set({ status: "paid" })
    .where(eq(pgInvoice.id, invoice.id));

  const billing = meta.pixCheckout;
  after(async () => {
    await triggerCommissionIfApplicable(invoice as any).catch(() => {});
    if (billing) {
      await processInvoiceAfterPayment(invoice, user, billing);
    }
    await handleVpsNonCardPaid(invoice as Invoice, user, "pix");
    await triggerPurchaseNotifications(invoice, user, billing ?? undefined);
  });

  return { confirmed: true };
}

/** Polling do status PIX (Simpay). Quando COMPLETED, marca como pago e processa em background. */
export async function syncCheckoutPixPayment(
  invoiceId: string
): Promise<{ status: "PENDING" | "COMPLETED" }> {
  let user = await getOptionalUser();

  const invoice = await db.query.pgInvoice.findFirst({
    where: eq(pgInvoice.id, invoiceId),
    with: { user: { with: { organization: true } } },
  });

  if (!invoice) return { status: "PENDING" };

  // Fallback to invoice user if no session (guest checkout for existing user)
  if (!user) {
    user = invoice.user as any;
  }

  if (!user || invoice.orgId !== user.organization.id) {
    return { status: "PENDING" };
  }

  if (invoice.status === "paid") {
    return { status: "COMPLETED" };
  }

  const meta = invoice.metadata as DomainRegisterInvoiceOptions;
  const paymentId = meta.simpayPaymentId;
  const billing = meta.pixCheckout;

  if (!paymentId || !billing) {
    return { status: "PENDING" };
  }

  // Check DOM directly first (no webhook wait) then fall back to DB-based status
  const isCompleted = await verifySimpayPixCompleted(paymentId);

  if (isCompleted) {
    await db
      .update(pgInvoice)
      .set({ status: "paid" })
      .where(eq(pgInvoice.id, invoice.id));

    after(async () => {
      await triggerCommissionIfApplicable(invoice as any).catch(() => {});
      await processInvoiceAfterPayment(invoice, user, billing);
      await handleVpsNonCardPaid(invoice as Invoice, user, "pix");
      await triggerPurchaseNotifications(invoice, user, {
        ...billing,
        paymentMethod: "pix",
      });
    });

    return { status: "COMPLETED" };
  }

  return { status: "PENDING" };
}

/**
 * Mensagem de erro segura para o cliente final: expõe o motivo amigável quando a
 * operadora recusa o pagamento, sem vazar detalhes internos (URLs, envs, stack).
 */
function friendlyCardPaymentError(err: unknown, fallback: string): string {
  if (err instanceof SimpayPaymentDeclinedError) return err.message;
  return fallback;
}

/** Devolve a fatura para "pending" após falha de pagamento, permitindo nova tentativa. */
async function revertInvoiceToPending(invoiceId: string): Promise<void> {
  try {
    await db
      .update(pgInvoice)
      .set({ status: "pending" })
      .where(eq(pgInvoice.id, invoiceId));
  } catch (e) {
    console.error(
      `[CHECKOUT] Falha ao reverter fatura ${invoiceId} para pendente:`,
      e
    );
  }
}

async function fetchAtlasBuyerRates(
  n: number
): Promise<{ rate: number; fixedFee: number } | null> {
  const apiUrl = process.env.SIMPAY_API_URL;
  if (!apiUrl) return null;
  try {
    const res = await fetch(`${apiUrl}/checkout/public/cc-rates/ATLAS`, {
      cache: "force-cache",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      masterCcRate?: number;
      installments?: Array<{ n: number; buyerRate: number; fixedFee: number }>;
    };
    const inst = json.installments?.find(i => i.n === n);
    if (inst) return { fixedFee: inst.fixedFee, rate: inst.buyerRate };
    // fallback: 1x → masterCcRate (0% for ATLAS), 0 fixedFee
    if (typeof json.masterCcRate === "number")
      return { fixedFee: 0, rate: json.masterCcRate };
    return null;
  } catch {
    return null;
  }
}

/**
 * PIX é liberado por padrão apenas no plano de 24 meses. O admin pode liberar
 * PIX para todas as durações (1/12/24 meses) em /admin/vps-plans.
 */
async function isPixEligibleForVpsDuration(
  intervalMonths: number
): Promise<boolean> {
  if (intervalMonths === 24) return true;
  const systemConfig = await db.query.pgSystemConfig.findFirst();
  return systemConfig?.pixAllowAllDurations ?? false;
}

/**
 * Admin-generated payment links set their own PIX rule at creation time
 * (config.customLinkAllowPix), overriding the duration-based rule entirely.
 */
export async function isPixEligibleForVpsConfig(config: any): Promise<boolean> {
  const override = config?.customLinkAllowPix;
  if (typeof override === "boolean") return override;
  if (
    typeof override === "string" &&
    (override === "true" || override === "false")
  )
    return override === "true";

  const intervalMonths = Number.parseInt(config?.duration || "1", 10);
  return isPixEligibleForVpsDuration(intervalMonths);
}

/** Boleto fica desligado por padrão. O admin libera globalmente em /admin/vps-plans. */
export async function isBoletoEnabledGlobally(): Promise<boolean> {
  const systemConfig = await db.query.pgSystemConfig.findFirst();
  return systemConfig?.boletoEnabled ?? false;
}

/**
 * Links de pagamento customizados podem liberar boleto individualmente
 * (config.customLinkAllowBoleto), sobrepondo a chave global do admin.
 */
export async function isBoletoEligibleForVpsConfig(
  config: any
): Promise<boolean> {
  const override = config?.customLinkAllowBoleto;
  if (typeof override === "boolean") return override;
  if (
    typeof override === "string" &&
    (override === "true" || override === "false")
  )
    return override === "true";

  return isBoletoEnabledGlobally();
}

async function createVpsSubscriptionIfNeeded(
  invoice: Invoice,
  user: { id: string; organization: { id: string } },
  opts: { paymentMethod: "credit_card" | "pix" | "boleto"; cardToken?: string }
): Promise<void> {
  if (invoice.type !== "vps") return;
  const meta = invoice.metadata as any;
  const config = meta?.config || {};
  const intervalMonths: number = Number.parseInt(config.duration || "1", 10);
  if (
    opts.paymentMethod === "pix" &&
    !(await isPixEligibleForVpsConfig(config))
  )
    return;
  if (
    opts.paymentMethod === "boleto" &&
    !(await isBoletoEligibleForVpsConfig(config))
  )
    return;
  const planType =
    config.type === "vds"
      ? "vds"
      : config.type === "storage-vps"
        ? "storage-vps"
        : config.type === "vps-windows"
          ? "vps-windows"
          : "vps";
  const nextChargeDate = firstRenewalDate(new Date(), intervalMonths);

  const finalConfig = opts.cardToken
    ? { ...config, cardToken: opts.cardToken }
    : config;

  try {
    await db.insert(pgVpsSubscription).values({
      amountBrl: invoice.amount,
      config: finalConfig,
      failureCount: 0,
      intervalMonths,
      lastInvoiceId: invoice.id,
      nextChargeDate,
      orgId: user.organization.id,
      paymentMethod: opts.paymentMethod,
      planId: meta?.vpsId || "10",
      planType: planType as any,
      status: "active",
      userId: user.id,
    });
    console.log(
      `[SUBSCRIPTION] ✓ Assinatura VPS criada para fatura ${invoice.id} (${opts.paymentMethod}) — próxima cobrança: ${nextChargeDate.toISOString()}`
    );
  } catch (err) {
    console.error("[SUBSCRIPTION] ✗ Erro ao criar assinatura VPS:", err);
  }
}

/**
 * Conclui o pagamento PIX de uma fatura VPS: renova a assinatura existente
 * (faturas isRenewal) ou cria uma nova assinatura PIX (compra anual).
 */
/**
 * Confirma o lado "assinatura VPS" de uma fatura paga por um método sem cobrança
 * automática recorrente (PIX ou boleto — nenhum dos dois tem token de cartão pra
 * cobrar de novo sozinho). Se for renovação de assinatura existente, avança a
 * data da próxima cobrança; se for compra nova, cria a assinatura (pausada, à
 * espera de renovação manual — mesmo comportamento que já existia pro PIX).
 */
async function handleVpsNonCardPaid(
  invoice: Invoice,
  user: { id: string; organization: { id: string } },
  paymentMethod: "pix" | "boleto"
): Promise<void> {
  if (invoice.type !== "vps") return;
  const meta = invoice.metadata as any;

  if (meta?.isRenewal && meta?.subscriptionId) {
    try {
      const sub = await db.query.pgVpsSubscription.findFirst({
        where: eq(pgVpsSubscription.id, meta.subscriptionId),
      });
      if (!sub) return;
      const onSchedule =
        !!sub.nextChargeDate && sub.nextChargeDate.getTime() > Date.now();
      const nextChargeDate = onSchedule
        ? nextRenewalDate(new Date(sub.nextChargeDate), sub.intervalMonths)
        : firstRenewalDate(new Date(), sub.intervalMonths);
      await db
        .update(pgVpsSubscription)
        .set({
          failureCount: 0,
          lastInvoiceId: invoice.id,
          nextChargeDate,
          pausedAt: null,
          status: "active",
          updatedAt: new Date(),
        })
        .where(eq(pgVpsSubscription.id, sub.id));
      console.log(
        `[SUBSCRIPTION] ✓ Renovação ${paymentMethod.toUpperCase()} da assinatura ${sub.id} — próxima cobrança: ${nextChargeDate.toISOString()}`
      );
    } catch (err) {
      console.error(
        `[SUBSCRIPTION] ✗ Erro ao renovar assinatura VPS (${paymentMethod}):`,
        err
      );
    }
    return;
  }

  await createVpsSubscriptionIfNeeded(invoice, user, { paymentMethod });
}

export async function completeCheckout(
  prevState: unknown,
  {
    invoiceId,
    ...values
  }: CheckoutFormInputs & { invoiceId: string; cardToken?: string }
): Promise<ActionResponse> {
  let user = await getUser();

  if (!invoiceId) {
    return { message: "ID da fatura é obrigatório.", status: "error" };
  }

  let invoice = await db.query.pgInvoice.findFirst({
    where: eq(pgInvoice.id, invoiceId),
    with: { user: { with: { organization: true } } },
  });

  if (!invoice) {
    return { message: "Fatura não encontrada.", status: "error" };
  }

  // Fallback to invoice user if no session
  if (!user) {
    user = invoice.user as any;
  }

  if (!user) {
    return {
      message: "Usuário não encontrado. Faça login para continuar.",
      status: "error",
    };
  }

  const selectedInstallments = values.installments ?? 1;
  const buyerRates = await fetchAtlasBuyerRates(selectedInstallments);
  if (buyerRates === null) {
    return {
      message: "Não foi possível obter as taxas de pagamento. Tente novamente.",
      status: "error",
    };
  }

  console.log(
    "\n[CHECKOUT] ==================== INICIANDO CHECKOUT (NOVO CARTÃO) ===================="
  );
  console.log(`[CHECKOUT] Invoice ID: ${invoiceId} | Usuário: ${user.id}`);

  // Update status to processing
  const updatedInvoice = await db
    .update(pgInvoice)
    .set({ status: "processing" })
    .where(eq(pgInvoice.id, invoiceId))
    .returning()
    .execute()
    .then(r => r[0]);

  if (updatedInvoice) {
    invoice = updatedInvoice as any;
  }

  if (!invoice) throw new Error("Fatura não encontrada");

  console.log("[CHECKOUT] Fatura carregada:", {
    amount: `R$ ${invoice.amount.toFixed(2)}`,
    id: invoice.id,
    metadata: invoice.metadata,
    reference: invoice.reference,
    status: invoice.status,
    type: invoice.type,
  });

  if (!user.organization?.domId) {
    console.log("[DOM] Organização sem cliente DOM. Criando novo cliente...");
    try {
      const clientPayload = {
        address: {
          city: values.address.city,
          neighborhood: values.address.neighborhood,
          number: values.address.number,
          state: values.address.state,
          street: values.address.street,
          zip_code: values.address.zipCode.replace(/\D/g, ""),
        },
        codeExternal: user.id,
        document: values.document.replace(/\D/g, ""),
        email: user.email,
        mobilePhone: values.phoneNumber.replace(/\D/g, ""),
        name: user.name,
        userId: user.id,
      };
      console.log("[DOM] → Enviando createClient:", {
        document: `***${clientPayload.document.slice(-4)}`,
        email: clientPayload.email,
        name: clientPayload.name,
      });

      const { id } = await domApi.createClient(clientPayload);
      console.log(`[DOM] ✓ Cliente DOM criado com ID: ${id}`);

      await db
        .update(pgOrganization)
        .set({ domId: id })
        .where(eq(pgOrganization.id, user.organizationId ?? ""));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "[DOM] ✗ ERRO ao criar cliente:",
          error.response?.data ?? error.request ?? error.message
        );
      } else {
        console.error("[DOM] ✗ ERRO ao criar cliente:", error);
      }
      return {
        message: "Erro ao criar cliente no sistema de domínios.",
        status: "error",
      };
    }
  } else {
    console.log(`[DOM] Cliente DOM já existe: ${user.organization.domId}`);
  }

  const [expMonth, expYear] = values.cardExpiration.split("/");
  const fullYear = 2000 + Number.parseInt(expYear, 10);

  let { cardToken } = values;

  if (!cardToken) {
    console.log(
      `[DOM] Tokenizando cartão: **** **** **** ${values.cardNumber.replace(/\D/g, "").slice(-4)} | Portador: ${values.firstName} ${values.lastName} | Validade: ${values.cardExpiration}`
    );
    try {
      const tokenData = await domApi.createCardToken(user.id, {
        cvv: values.cardCvv,
        exp_month: Number.parseInt(expMonth, 10),
        exp_year: fullYear,
        holder_document: values.document.replace(/\D/g, ""),
        holder_name: `${values.firstName} ${values.lastName}`,
        number: values.cardNumber.replace(/\D/g, ""),
      });

      console.log("[DOM] ✓ Cartão tokenizado:", {
        brand: tokenData.brand,
        expiryMonth: tokenData.expiryMonth,
        expiryYear: tokenData.expiryYear,
        last4: tokenData.last4,
        token: tokenData.token,
      });

      if (!user?.organization?.wallet) {
        console.error("[CHECKOUT] Carteira da organização não encontrada.");
        return { message: "Carteira não encontrada", status: "error" };
      }

      const existingCards = await db.$count(
        pgUserCard,
        eq(pgUserCard.walletId, user.organization.wallet.id)
      );
      const isFirstCard = existingCards === 0;
      console.log(
        `[CHECKOUT] Cartões existentes: ${existingCards} | É o cartão padrão: ${isFirstCard}`
      );

      await db.insert(pgUserCard).values({
        brand: tokenData.brand,
        cardToken: tokenData.token,
        expiryMonth: tokenData.expiryMonth,
        expiryYear: tokenData.expiryYear,
        holderName: tokenData.holderName,
        isDefault: isFirstCard,
        last4: tokenData.last4,
        walletId: user.organization.wallet.id,
      });

      cardToken = tokenData.token;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error(
          "[DOM] ✗ ERRO na tokenização do cartão:",
          err.response?.data ?? err.request ?? err.message
        );
      } else {
        console.error("[DOM] ✗ ERRO na tokenização do cartão:", err);
      }
      throw err;
    }
  } else {
    console.log(`[DOM] Usando cardToken já fornecido: ${cardToken}`);
  }

  const chargeAmount =
    Math.round(
      (invoice.amount * (1 + buyerRates.rate) + buyerRates.fixedFee) * 100
    ) / 100;
  console.log(
    `[CHECKOUT] Valor base: R$ ${invoice.amount.toFixed(2)} | Parcelas: ${selectedInstallments}x | Taxa comprador (${(buyerRates.rate * 100).toFixed(2)}% + R$${buyerRates.fixedFee}): R$ ${(chargeAmount - invoice.amount).toFixed(2)} | Total: R$ ${chargeAmount.toFixed(2)}`
  );

  if (invoice.type === "domain") {
    console.log("\n[SIMPAY] ── PAGAMENTO ÚNICO (DOMÍNIO) ──");
    try {
      const simpayResult = await simpayApi.createCardPayment({
        bin: cardToken.substring(0, 6),
        brand: "unknown",
        description: atlasSimpayInvoiceDescription(invoice.reference),
        document: values.document.replace(/\D/g, ""),
        document_type:
          values.document.replace(/\D/g, "").length === 11 ? "CPF" : "CNPJ",
        email: user.email,
        holder_name: `${values.firstName} ${values.lastName}`.trim(),
        installments: selectedInstallments,
        mobile_phone: values.phoneNumber.replace(/\D/g, ""),
        name: `${values.firstName} ${values.lastName}`.trim(),
        price: chargeAmount,
        token: cardToken,
      });
      console.log("[SIMPAY] ✓ Pagamento registrado na Simpay:", {
        paymentId: simpayResult.paymentId,
        status: simpayResult.status,
        transactionId: simpayResult.transactionId,
      });
    } catch (err) {
      console.error("[SIMPAY] ✗ ERRO ao registrar pagamento na Simpay:", err);
      await revertInvoiceToPending(invoiceId);
      return {
        message: friendlyCardPaymentError(
          err,
          "Não foi possível processar o pagamento do domínio. Nenhuma cobrança foi confirmada. Tente novamente em instantes."
        ),
        status: "error",
      };
    }

    const domainMeta = invoice.metadata as DomainRegisterInvoiceOptions;
    if (domainMeta.testPaymentOnly) {
      await db
        .update(pgInvoice)
        .set({ status: "paid" })
        .where(eq(pgInvoice.id, invoiceId));
      console.log("[CHECKOUT] Fatura de teste paga (cartão, sem Namecheap).");
      redirect(paymentSuccessUrl(invoiceId));
    }

    const domainMetaTyped = invoice.metadata as
      | DomainRegisterInvoiceOptions
      | DomainRenewInvoiceOptions;
    if ((domainMetaTyped as DomainRenewInvoiceOptions).type === "renew") {
      await db
        .update(pgInvoice)
        .set({ status: "paid" })
        .where(eq(pgInvoice.id, invoiceId));
      after(async () => {
        const { renewed } = await renewDomainFromPaidInvoice(invoice);
        if (!renewed)
          console.error(
            `[NAMECHEAP] Falha ao renovar domínio para fatura ${invoiceId}`
          );
      });
      redirect("/domains");
    }

    const contact = {
      Address1: `${values.address.street}, ${values.address.number}`,
      City: values.address.city,
      Country: "BR",
      EmailAddress: user.email,
      FirstName: values.firstName.trim(),
      LastName: values.lastName.trim(),
      Phone: `+55.${values.phoneNumber.replace(/\D/g, "")}`,
      PostalCode: values.address.zipCode.replace(/\D/g, ""),
      StateProvince: values.address.state,
    };

    await db
      .update(pgInvoice)
      .set({ status: "paid" })
      .where(eq(pgInvoice.id, invoiceId));
    await triggerCommissionIfApplicable(invoice as any).catch(() => {});
    after(async () => {
      console.log("\n[NAMECHEAP] ── REGISTRANDO DOMÍNIO(S) ──");
      const { registered, failed } = await registerDomainsFromPaidInvoice(
        invoice,
        contact as NamecheapContactDetails
      );
      if (failed.length)
        console.error("[NAMECHEAP] Falha parcial/total:", failed);
      if (registered.length)
        console.log("[NAMECHEAP] ✓ Registrados:", registered.join(", "));
      else
        console.warn(
          `[NAMECHEAP] ✗ Nenhum domínio registrado para fatura ${invoiceId}`
        );
      await sendWelcomePasswordEmailIfGuest(invoice, user as any);
    });
    console.log(
      `[CHECKOUT] ✓ Fatura ${invoiceId} marcada como PAGA. Redirecionando para /payment/success.`
    );
    redirect(paymentSuccessUrl(invoiceId));
  }

  console.log("\n[SIMPAY] ── PAGAMENTO RECORRENTE (ASSINATURA) ──");
  try {
    const result = await simpayApi.createCardPayment({
      bin: cardToken.substring(0, 6),
      brand: "unknown",
      description: atlasSimpayInvoiceDescription(invoice.reference),
      document: values.document.replace(/\D/g, ""),
      document_type:
        values.document.replace(/\D/g, "").length === 11 ? "CPF" : "CNPJ",
      email: user.email,
      holder_name: `${values.firstName} ${values.lastName}`.trim(),
      installments: selectedInstallments,
      mobile_phone: values.phoneNumber.replace(/\D/g, ""),
      name: `${values.firstName} ${values.lastName}`.trim(),
      price: chargeAmount,
      token: cardToken,
    });
    console.log("[SIMPAY] ✓ Assinatura registrada na Simpay:", {
      paymentId: result.paymentId,
      status: result.status,
      transactionId: result.transactionId,
    });
  } catch (err) {
    console.error("[SIMPAY] ✗ ERRO ao registrar assinatura na Simpay:", err);
    await revertInvoiceToPending(invoiceId);
    return {
      message: friendlyCardPaymentError(
        err,
        "Não foi possível concluir o pagamento. Nenhuma cobrança foi confirmada. Verifique os dados do cartão e tente novamente."
      ),
      status: "error",
    };
  }

  console.log(
    "[CHECKOUT] ✓ Checkout concluído. Redirecionando para /payment/success."
  );
  await db
    .update(pgInvoice)
    .set({ status: "paid" })
    .where(eq(pgInvoice.id, invoiceId));
  await triggerCommissionIfApplicable(invoice as any).catch(() => {});
  after(async () => {
    await sendWelcomePasswordEmailIfGuest(invoice, user as any);
    await triggerPurchaseNotifications(invoice, user, {
      ...values,
      paymentMethod: "credit_card",
    });
    await createVpsSubscriptionIfNeeded(invoice as Invoice, user, {
      cardToken,
      paymentMethod: "credit_card",
    });
  });

  redirect(paymentSuccessUrl(invoiceId));

  return { message: "Plano adquirido com sucesso!", status: "success" };
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
  let user = await getUser();

  if (!invoiceId) {
    return { message: "ID da fatura é obrigatório.", status: "error" };
  }

  let invoice = await db.query.pgInvoice.findFirst({
    where: eq(pgInvoice.id, invoiceId),
    with: { user: { with: { organization: true } } },
  });

  if (!invoice) {
    return { message: "Fatura não encontrada.", status: "error" };
  }

  // Fallback to invoice user if no session
  if (!user) {
    user = invoice.user as any;
  }

  if (!user) {
    return {
      message: "Usuário não encontrado. Faça login para continuar.",
      status: "error",
    };
  }

  if (!card) {
    return { message: "Token do cartão é obrigatório.", status: "error" };
  }

  const savedInstallments = (values as any).installments ?? 1;
  const savedCardBuyerRates = await fetchAtlasBuyerRates(savedInstallments);
  if (savedCardBuyerRates === null) {
    return {
      message: "Não foi possível obter as taxas de pagamento. Tente novamente.",
      status: "error",
    };
  }

  // Update status to processing
  const updatedInvoice = await db
    .update(pgInvoice)
    .set({
      status: "processing",
    })
    .where(eq(pgInvoice.id, invoiceId))
    .returning()
    .execute()
    .then(r => r[0]);

  if (updatedInvoice) {
    invoice = updatedInvoice as any;
  }

  if (!invoice) {
    console.error(`[CHECKOUT-SAVED] Fatura ${invoiceId} não encontrada.`);
    return { message: "Fatura não encontrada.", status: "error" };
  }

  console.log(
    "\n[CHECKOUT-SAVED] ==================== INICIANDO CHECKOUT (CARTÃO SALVO) ===================="
  );
  console.log(
    `[CHECKOUT-SAVED] Invoice ID: ${invoiceId} | Usuário: ${user.id} | Cartão: **** ${card.last4} (${card.brand})`
  );
  console.log("[CHECKOUT-SAVED] Fatura:", {
    amount: `R$ ${invoice.amount.toFixed(2)}`,
    id: invoice.id,
    metadata: invoice.metadata,
    reference: invoice.reference,
    type: invoice.type,
  });

  // Ensure DOM client exists
  if (!user.organization?.domId) {
    console.log("[DOM] Organização sem cliente DOM. Criando novo cliente...");
    try {
      const clientPayload = {
        address: {
          city: values.address.city,
          neighborhood: values.address.neighborhood,
          number: values.address.number,
          state: values.address.state,
          street: values.address.street,
          zip_code: values.address.zipCode.replace(/\D/g, ""),
        },
        codeExternal: user.id,
        document: values.document.replace(/\D/g, ""),
        email: user.email,
        mobilePhone: values.phoneNumber.replace(/\D/g, ""),
        name: user.name,
        userId: user.id,
      };
      console.log("[DOM] → Enviando createClient:", {
        document: `***${clientPayload.document.slice(-4)}`,
        email: clientPayload.email,
        name: clientPayload.name,
      });

      const { id } = await domApi.createClient(clientPayload);
      console.log(`[DOM] ✓ Cliente DOM criado com ID: ${id}`);

      await db
        .update(pgOrganization)
        .set({ domId: id })
        .where(eq(pgOrganization.id, user.organizationId ?? ""));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "[DOM] ✗ ERRO ao criar cliente:",
          error.response?.data ?? error.request ?? error.message
        );
      } else {
        console.error("[DOM] ✗ ERRO ao criar cliente:", error);
      }
      return {
        message: "Erro ao criar cliente no sistema de pagamentos.",
        status: "error",
      };
    }
  } else {
    console.log(`[DOM] Cliente DOM já existe: ${user.organization.domId}`);
  }

  const savedChargeAmount =
    Math.round(
      (invoice.amount * (1 + savedCardBuyerRates.rate) +
        savedCardBuyerRates.fixedFee) *
        100
    ) / 100;
  console.log(
    `[CHECKOUT-SAVED] Valor base: R$ ${invoice.amount.toFixed(2)} | Parcelas: ${savedInstallments}x | Taxa comprador (${(savedCardBuyerRates.rate * 100).toFixed(2)}% + R$${savedCardBuyerRates.fixedFee}): R$ ${(savedChargeAmount - invoice.amount).toFixed(2)} | Total: R$ ${savedChargeAmount.toFixed(2)}`
  );

  if (invoice.type === "domain") {
    console.log("\n[SIMPAY] ── PAGAMENTO ÚNICO (DOMÍNIO / CARTÃO SALVO) ──");
    try {
      const domResult = await simpayApi.createCardPayment({
        bin: card.last4 || cardToken.substring(0, 6),
        brand: card.brand || "unknown",
        description: atlasSimpayInvoiceDescription(invoice.reference),
        document: values.document.replace(/\D/g, ""),
        document_type:
          values.document.replace(/\D/g, "").length === 11 ? "CPF" : "CNPJ",
        email: user.email,
        holder_name:
          card.holderName || `${values.firstName} ${values.lastName}`.trim(),
        installments: savedInstallments,
        mobile_phone: values.phoneNumber.replace(/\D/g, ""),
        name: `${values.firstName} ${values.lastName}`.trim(),
        price: savedChargeAmount,
        token: cardToken,
      });
      console.log("[SIMPAY] ✓ Pagamento registrado na Simpay:", {
        paymentId: domResult.paymentId,
        status: domResult.status,
        transactionId: domResult.transactionId,
      });
    } catch (err) {
      console.error("[SIMPAY] ✗ ERRO ao registrar pagamento na Simpay:", err);
      await revertInvoiceToPending(invoiceId);
      return {
        message: friendlyCardPaymentError(
          err,
          "Não foi possível processar o pagamento do domínio. Nenhuma cobrança foi confirmada. Tente novamente em instantes."
        ),
        status: "error",
      };
    }

    const domainMetaSaved = invoice.metadata as DomainRegisterInvoiceOptions;
    if (domainMetaSaved.testPaymentOnly) {
      await db
        .update(pgInvoice)
        .set({ status: "paid" })
        .where(eq(pgInvoice.id, invoiceId));
      console.log("[CHECKOUT-SAVED] Fatura de teste paga (sem Namecheap).");
      return { message: paymentSuccessUrl(invoiceId), status: "success" };
    }

    const domainMetaSavedTyped = invoice.metadata as
      | DomainRegisterInvoiceOptions
      | DomainRenewInvoiceOptions;
    if ((domainMetaSavedTyped as DomainRenewInvoiceOptions).type === "renew") {
      await db
        .update(pgInvoice)
        .set({ status: "paid" })
        .where(eq(pgInvoice.id, invoiceId));
      after(async () => {
        const { renewed } = await renewDomainFromPaidInvoice(invoice);
        if (!renewed)
          console.error(
            `[NAMECHEAP] Falha ao renovar domínio (cartão salvo) para fatura ${invoiceId}`
          );
      });
      return { message: "/domains", status: "success" };
    }

    const contact = {
      Address1: `${values.address.street}, ${values.address.number}`,
      City: values.address.city,
      Country: "BR",
      EmailAddress: user.email,
      FirstName: values.firstName.trim(),
      LastName: values.lastName.trim(),
      Phone: `+55.${values.phoneNumber.replace(/\D/g, "")}`,
      PostalCode: values.address.zipCode.replace(/\D/g, ""),
      StateProvince: values.address.state,
    };

    await db
      .update(pgInvoice)
      .set({ status: "paid" })
      .where(eq(pgInvoice.id, invoiceId));
    await triggerCommissionIfApplicable(invoice as any).catch(() => {});
    console.log(`[CHECKOUT-SAVED] ✓ Fatura ${invoiceId} marcada como PAGA.`);
    after(async () => {
      console.log("\n[NAMECHEAP] ── REGISTRANDO DOMÍNIO(S) (CARTÃO SALVO) ──");
      const { registered, failed } = await registerDomainsFromPaidInvoice(
        invoice,
        contact as NamecheapContactDetails
      );
      if (failed.length)
        console.error(
          "[NAMECHEAP] Falha parcial/total (cartão salvo):",
          failed
        );
      if (registered.length)
        console.log("[NAMECHEAP] ✓ Registrados:", registered.join(", "));
    });

    return { message: paymentSuccessUrl(invoiceId), status: "success" };
  }

  console.log(
    "\n[SIMPAY] ── PAGAMENTO RECORRENTE (ASSINATURA / CARTÃO SALVO) ──"
  );
  try {
    const result = await simpayApi.createCardPayment({
      bin: card.last4 || cardToken.substring(0, 6),
      brand: card.brand || "unknown",
      description: atlasSimpayInvoiceDescription(invoice.reference),
      document: values.document.replace(/\D/g, ""),
      document_type:
        values.document.replace(/\D/g, "").length === 11 ? "CPF" : "CNPJ",
      email: user.email,
      holder_name:
        card.holderName || `${values.firstName} ${values.lastName}`.trim(),
      installments: savedInstallments,
      mobile_phone: values.phoneNumber.replace(/\D/g, ""),
      name: `${values.firstName} ${values.lastName}`.trim(),
      price: savedChargeAmount,
      token: cardToken,
    });
    console.log("[SIMPAY] ✓ Assinatura registrada na Simpay (cartão salvo):", {
      paymentId: result.paymentId,
      status: result.status,
      transactionId: result.transactionId,
    });
  } catch (err) {
    console.error(
      "[SIMPAY] ✗ ERRO ao registrar assinatura na Simpay (cartão salvo):",
      err
    );
    await revertInvoiceToPending(invoiceId);
    return {
      message: friendlyCardPaymentError(
        err,
        "Não foi possível concluir o pagamento com o cartão salvo. Nenhuma cobrança foi confirmada. Tente outro cartão ou método de pagamento."
      ),
      status: "error",
    };
  }

  console.log("[CHECKOUT-SAVED] ✓ Checkout concluído com cartão salvo.");
  await db
    .update(pgInvoice)
    .set({ status: "paid" })
    .where(eq(pgInvoice.id, invoiceId));
  await triggerCommissionIfApplicable(invoice as any).catch(() => {});

  after(async () => {
    await triggerPurchaseNotifications(invoice, user, {
      ...values,
      paymentMethod: "credit_card",
    });
    await createVpsSubscriptionIfNeeded(invoice as Invoice, user, {
      cardToken,
      paymentMethod: "credit_card",
    });
  });

  return { message: paymentSuccessUrl(invoiceId), status: "success" };
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
  firstName: string;
  lastName: string;
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
      return { message: "Unauthorized", status: "error" };
    }

    // Handle both single instanceId and comma-separated list
    const ids = instanceIds.split(",").map(id => Number.parseInt(id, 10));

    if (ids.some(Number.isNaN)) {
      return { message: "Invalid instance ID", status: "error" };
    }

    // Delete all instances in parallel
    await Promise.all(
      ids.map(async id => {
        // TODO: delete DNS entries.
        await pleskApi.wordpress.uninstallWp(id);
      })
    );

    revalidatePath("/sites");

    return { message: "Sites excluídos com sucesso", status: "success" };
  } catch (error) {
    console.error("Error deleting WordPress instances:", error);
    return { message: "Erro ao excluir sites", status: "error" };
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
    return { message: "Usuário não autenticado", status: "error" };
  }

  if (!domainName) {
    return { message: "Nome do domínio é obrigatório", status: "error" };
  }

  try {
    await db
      .update(pgUser)
      .set({ selectedDomain: domainName })
      .where(eq(pgUser.id, user.id));

    revalidateTag("current-domain", "default");
    revalidateTag("session-validate", "default");
    revalidatePath("/", "layout");

    return {
      message: "Domínio padrão atualizado com sucesso",
      status: "success",
    };
  } catch (error) {
    console.error("Erro ao atualizar domínio padrão:", error);
    return { message: "Erro ao atualizar domínio padrão", status: "error" };
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
      referrals_count: sql<number>`COUNT(DISTINCT ${pgUser.id})`,
      total_amount: sql<number>`SUM(${pgInvoice.amount})`,
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
  const chartData = monthlyData.map(row => {
    const earnings =
      +(row.total_amount || 0) * (systemConfig.referrerCommission / 100);
    const month = new Date(row.month).toLocaleDateString("pt-BR", {
      month: "short",
    });

    return {
      earnings,
      month: month.charAt(0).toUpperCase() + month.slice(1),
      referrals: +row.referrals_count || 0,
    };
  });

  return chartData;
}

/**
 * Tenta adicionar o domínio ao Plesk para criar a zona DNS e hosting.
 * O Plesk cria automaticamente a zona DNS ao adicionar um domínio.
 */
async function addDomainToPlesk(domain: string): Promise<boolean> {
  try {
    // Verifica se o domínio já existe no Plesk
    const existing = await pleskApi.getDomain(domain).catch(() => null);
    if (existing) {
      console.log(
        `[PLESK] Domínio ${domain} já existe no Plesk (id: ${existing.id})`
      );
      return true;
    }

    // Adiciona o domínio ao Plesk — isso cria a zona DNS automaticamente
    await pleskApi.domainsApi.domainsPost({
      hosting_type: "none" as any, // Sem hosting, só DNS
      name: domain,
    });
    console.log(`[PLESK] Domínio ${domain} adicionado ao Plesk com sucesso`);
    return true;
  } catch (err) {
    console.warn(`[PLESK] Falha ao adicionar domínio ${domain} ao Plesk:`, err);
    return false;
  }
}

/** IP do servidor para onde os domínios transferidos devem apontar */
function getServerIp(): string {
  return process.env.SERVER_IP || "186.194.55.237";
}

export async function addDomainForTransfer(
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse> {
  const user = await getUser();

  if (!user) {
    return { message: "Usuário não autenticado", status: "error" };
  }

  const domain = formData.get("domain") as string;

  if (!domain || domain.trim() === "") {
    return { message: "Nome do domínio é obrigatório", status: "error" };
  }

  // Basic domain validation
  const domainRegex =
    /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!domainRegex.test(domain.trim())) {
    return { message: "Formato de domínio inválido", status: "error" };
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
      return {
        message: "Este domínio já foi adicionado à sua organização",
        status: "error",
      };
    }

    // Add domain to organization with active = false (pending transfer)
    await db.insert(pgOrganizationDomains).values({
      active: false,
      domain: domain.trim().toLowerCase(),
      organizationId: user.organization.id,
    });

    // Tenta adicionar o domínio ao Plesk em background (cria zona DNS)
    addDomainToPlesk(domain.trim().toLowerCase()).catch(() => {});

    revalidatePath("/domain");

    return {
      message: `Domínio adicionado com sucesso! Agora aponte o registro A do seu domínio para ${getServerIp()} no seu registrador atual.`,
      status: "success",
    };
  } catch (error) {
    console.error("Erro ao adicionar domínio:", error);
    return { message: "Erro ao adicionar domínio", status: "error" };
  }
}

export async function searchDomains(
  _prevState: unknown,
  searchQuery: string
): Promise<void> {
  redirect(`/domains/register?search=${encodeURIComponent(searchQuery)}`);
}

export async function checkDomainNameservers(
  prevState: unknown,
  formData: FormData
): Promise<
  ActionResponse & {
    nameservers?: string[];
    isCorrect?: boolean;
    serverIp?: string;
  }
> {
  const domain = formData.get("domain") as string;

  if (!domain) {
    return { message: "Domínio é obrigatório", status: "error" };
  }

  const expectedIp = getServerIp();

  try {
    // Consulta o registro A do domínio nos resolvers públicos
    const response = await query(
      { question: { name: domain, type: "A" } },
      { endpoints: ["1.1.1.1", "8.8.8.8"] }
    ).catch(() => null);

    const resolvedIps =
      response?.answers
        ?.filter(ans => ans.type === "A")
        .map(ans => (ans.data as string).trim()) ?? [];

    const isCorrect = resolvedIps.some(ip => ip === expectedIp);

    console.log(
      `[DNS Check] ${domain}: A records=[${resolvedIps.join(",")}] expected=${expectedIp} correct=${isCorrect}`
    );

    if (isCorrect) {
      // A record está correto — ativa o domínio
      const user = await getUser();
      if (user) {
        await db
          .update(pgOrganizationDomains)
          .set({ active: true })
          .where(
            and(
              eq(pgOrganizationDomains.organizationId, user.organization.id),
              eq(pgOrganizationDomains.domain, domain.toLowerCase())
            )
          );
      }

      // Tenta adicionar o domínio ao Plesk (se ainda não foi)
      addDomainToPlesk(domain.toLowerCase()).catch(() => {});

      revalidatePath("/domain");
      return {
        isCorrect: true,
        message:
          "Registro A confirmado! Seu domínio agora está ativo na Atlas Hosting.",
        nameservers: resolvedIps,
        serverIp: expectedIp,
        status: "success",
      };
    }

    revalidatePath("/domain");
    return {
      isCorrect: false,
      message:
        resolvedIps.length > 0
          ? `O domínio está apontando para ${resolvedIps.join(", ")} — esperávamos ${expectedIp}. Atualize o registro A no seu registrador.`
          : `Nenhum registro A encontrado para ${domain}. Configure o registro A apontando para ${expectedIp} no seu registrador.`,
      nameservers: resolvedIps,
      serverIp: expectedIp,
      status: "success",
    };
  } catch (error) {
    console.error("Erro ao verificar DNS:", error);
    return {
      message: "Erro ao verificar DNS. Tente novamente em alguns minutos.",
      status: "error",
    };
  }
}

export async function createVpsInvoice(data: {
  planId: string;
  config: any;
  guestInfo?: GuestInfo;
}) {
  const { planId, config, guestInfo } = data;
  let user = await getOptionalUser();
  const isGuestCheckout = !user && !!guestInfo;
  let guestPassword = "";

  if (!user) {
    if (guestInfo) {
      const guest = await findOrCreateGuestUser(guestInfo);
      user = guest.user as any;
      guestPassword = guest.passwordPlain || "";
    } else {
      return { message: "Usuário não autenticado.", status: "error" };
    }
  }

  if (!user) return { message: "Usuário não encontrado.", status: "error" };

  // Admin-generated custom payment link (arbitrary period, admin-typed price) — bypasses
  // the whole catalog pricing engine below entirely, the admin already decided the amount.
  const customLinkAmountBrl =
    typeof config.customLinkAmountBrl === "number"
      ? config.customLinkAmountBrl
      : typeof config.customLinkAmountBrl === "string" &&
          config.customLinkAmountBrl !== ""
        ? Number(config.customLinkAmountBrl)
        : undefined;
  if (
    customLinkAmountBrl !== undefined &&
    Number.isFinite(customLinkAmountBrl) &&
    customLinkAmountBrl > 0
  ) {
    const customDuration = Number.parseInt(config.duration || "1", 10);
    const customQty = Number.parseInt(config.qty || "1", 10);
    const customFinalAmountBrl = customLinkAmountBrl * customQty;
    try {
      const description = `Hospedagem ${planId} (${customDuration} ${customDuration === 1 ? "mês" : "meses"}) — cobrança personalizada`;
      const [newInvoice] = await db
        .insert(pgInvoice)
        .values({
          amount: customFinalAmountBrl,
          currency: "BRL",
          description,
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          metadata: {
            config,
            guestCheckout: isGuestCheckout || undefined,
            guestPassword: guestPassword || undefined,
            vpsId: planId,
          },
          orgId: user.organization.id,
          reference: `VPS-LINK-${planId}-${Date.now()}`,
          status: "pending",
          type: "vps",
          userId: user.id,
        })
        .returning();

      if (!newInvoice) throw new Error("Erro ao criar fatura.");

      if (typeof config.paymentLinkId === "string" && config.paymentLinkId) {
        await db
          .update(pgVpsPaymentLink)
          .set({
            resultingInvoiceId: newInvoice.id,
            status: "used",
            usedAt: new Date(),
          })
          .where(eq(pgVpsPaymentLink.id, config.paymentLinkId));
      }

      return {
        invoiceId: newInvoice.id,
        redirectUrl: `/checkout/${newInvoice.id}?initialStep=payment`,
        status: "success",
      };
    } catch (error) {
      console.error("Error creating custom-link VPS invoice:", error);
      return { message: "Erro ao processar o pedido.", status: "error" };
    }
  }

  // Fetch real-time EUR to BRL rate
  let RATE = 5.86; // Default/Fallback
  try {
    const [fetchedRate] = await currencyConversion.convertMultiple({
      amounts: [1],
      from: "eur",
      to: "brl",
    });
    RATE = fetchedRate;
  } catch (e) {
    console.error("Failed to fetch dynamic rate for invoice:", e);
    // Fallback based on plan tier if API fails
    RATE =
      planId === "20" ||
      planId === "30" ||
      planId === "40" ||
      planId === "50" ||
      planId === "60" ||
      planId === "s" ||
      planId === "m" ||
      planId === "l" ||
      planId === "xl" ||
      planId === "xxl"
        ? 5.79
        : 5.86;
  }

  // Four independent product lines share this function, each with its own pricing
  // scheme: Cloud VPS Core / VDS / Storage VPS (all 1/12/24 months, catalog-driven)
  // and legacy plain "vps" ids 10-60 (still 1/6/12 months, hardcoded below).
  const isStorageVps = config.type === "storage-vps";
  const isVdsPlan =
    !isStorageVps && ["s", "m", "l", "xl", "xxl"].includes(planId);
  const isContaboCloudPlan =
    !isStorageVps && !isVdsPlan && isCloudVpsPlanId(planId);
  const isLegacyVpsPlan = !isStorageVps && !isVdsPlan && !isContaboCloudPlan;

  const legacyBasePrices: Record<string, number> = {
    "10": 9.0,
    "20": 14.0,
    "30": 28.0,
    "40": 50.0,
    "50": 74.0,
    "60": 98.0,
  };

  const requestedContaboDuration =
    config.duration === "1" ? 1 : config.duration === "12" ? 12 : 24;

  const contaboMonthlyEuro = isContaboCloudPlan
    ? getCloudVpsMonthlyEuro(
        planId,
        config.backup === "true",
        requestedContaboDuration
      )
    : undefined;
  if (isContaboCloudPlan && contaboMonthlyEuro === undefined) {
    throw new Error(`Catálogo Contabo sem preço para o plano ${planId}`);
  }

  const vdsMonthlyEuro = isVdsPlan
    ? getVdsMonthlyEuro(
        planId,
        config.backup === "true",
        requestedContaboDuration
      )
    : undefined;
  if (isVdsPlan && vdsMonthlyEuro === undefined) {
    throw new Error(`Catálogo VDS sem preço para o plano ${planId}`);
  }

  const storageVpsMonthlyEuro = isStorageVps
    ? getStorageVpsMonthlyEuro(planId, requestedContaboDuration as 1 | 12 | 24)
    : undefined;
  if (isStorageVps && storageVpsMonthlyEuro === undefined) {
    throw new Error(`Catálogo Storage VPS sem preço para o plano ${planId}`);
  }

  const duration = isLegacyVpsPlan
    ? Number.parseInt(config.duration || "1", 10)
    : requestedContaboDuration;
  let monthlyEuro =
    contaboMonthlyEuro ??
    vdsMonthlyEuro ??
    storageVpsMonthlyEuro ??
    legacyBasePrices[planId] ??
    9.0;

  // Legacy plain "vps" duration discounts (ids 20/30/40/50/60, still 1/6/12 months).
  if (isLegacyVpsPlan) {
    const isHighTier =
      planId === "20" ||
      planId === "30" ||
      planId === "40" ||
      planId === "50" ||
      planId === "60";
    if (isHighTier) {
      if (duration === 6) {
        if (planId === "20") monthlyEuro = 12.6;
        else if (planId === "30") monthlyEuro = 25.2;
        else if (planId === "40") monthlyEuro = 45.0;
        else if (planId === "50") monthlyEuro = 66.6;
        else if (planId === "60") monthlyEuro = 88.2;
      }
      if (duration === 12) {
        if (planId === "20") monthlyEuro = 11.2;
        else if (planId === "30") monthlyEuro = 22.4;
        else if (planId === "40") monthlyEuro = 40.0;
        else if (planId === "50") monthlyEuro = 59.2;
        else if (planId === "60") monthlyEuro = 78.4;
      }
    } else {
      if (duration === 6) monthlyEuro = monthlyEuro * 0.9;
      if (duration === 12) monthlyEuro = monthlyEuro * 0.8;
    }
  }

  // Setup Fees — only the legacy plain "vps" tier "10" ever charges one.
  let setupBrl = 0;
  if (isLegacyVpsPlan && planId === "10") {
    if (duration === 1) setupBrl = 9.0 * RATE;
    if (duration === 6) setupBrl = 4.5 * RATE;
    if (duration === 12) setupBrl = 0;
  }

  // Add-ons (Monthly in Euro)
  let additionalMonthlyEuro = 0;

  // Location Prices (Doubled Atlas Prices)
  const locationPrices: Record<string, Record<string, number>> = {
    "10": {
      "au-sydney": 3.9,
      eu: 0,
      in: 4.3,
      jp: 4.7,
      sg: 4.3,
      uk: 1.9,
      "us-central": 1.9,
      "us-east": 2.8,
      "us-west": 2.3,
    },
    "20": {
      "au-sydney": 8.1,
      eu: 0,
      in: 8.9,
      jp: 8.9,
      sg: 8.9,
      uk: 2.9,
      "us-central": 2.9,
      "us-east": 2.9,
      "us-west": 3.7,
    },
    "30": {
      "au-sydney": 16.2,
      eu: 0,
      in: 17.8,
      jp: 17.8,
      sg: 17.8,
      uk: 5.9,
      "us-central": 5.9,
      "us-east": 5.9,
      "us-west": 7.3,
    },
    "40": {
      "au-sydney": 28.5,
      eu: 0,
      in: 31.3,
      jp: 31.3,
      sg: 31.3,
      uk: 10.5,
      "us-central": 10.5,
      "us-east": 10.5,
      "us-west": 13.1,
    },
    "50": {
      "au-sydney": 37.9,
      eu: 0,
      in: 41.6,
      jp: 41.6,
      sg: 41.6,
      uk: 15.6,
      "us-central": 15.6,
      "us-east": 27.1,
      "us-west": 19.3,
    },
    "60": {
      "au-sydney": 50.2,
      eu: 0,
      in: 55.0,
      jp: 55.0,
      sg: 55.0,
      uk: 20.6,
      "us-central": 20.6,
      "us-east": 30.7,
      "us-west": 25.6,
    },
    l: {
      "au-sydney": 66.4,
      eu: 0,
      in: 66.4,
      jp: 66.4,
      sg: 66.4,
      uk: 32.8,
      "us-central": 40.0,
      "us-east": 32.8,
      "us-west": 40.0,
    },
    m: {
      "au-sydney": 33.2,
      eu: 0,
      in: 33.2,
      jp: 33.2,
      sg: 33.2,
      uk: 16.4,
      "us-central": 20.0,
      "us-east": 16.4,
      "us-west": 20.0,
    },
    s: {
      "au-sydney": 16.6,
      eu: 0,
      in: 16.6,
      jp: 16.6,
      sg: 16.6,
      uk: 8.2,
      "us-central": 10.0,
      "us-east": 8.2,
      "us-west": 10.0,
    },
    xl: {
      "au-sydney": 99.6,
      eu: 0,
      in: 99.6,
      jp: 99.6,
      sg: 99.6,
      uk: 49.2,
      "us-central": 60.0,
      "us-east": 49.2,
      "us-west": 60.0,
    },
    xxl: {
      "au-sydney": 166.0,
      eu: 0,
      in: 166.0,
      jp: 166.0,
      sg: 166.0,
      uk: 82.0,
      "us-central": 100.0,
      "us-east": 82.0,
      "us-west": 100.0,
    },
  };

  const planLocPrices = isContaboCloudPlan
    ? CLOUD_VPS_LOCATION_EUR[planId as keyof typeof CLOUD_VPS_LOCATION_EUR] ||
      {}
    : locationPrices[planId] || {};
  if (planLocPrices[config.location] !== undefined) {
    additionalMonthlyEuro += planLocPrices[config.location];
  } else if (
    !isContaboCloudPlan &&
    config.location !== "eu" &&
    config.location !== "best"
  ) {
    additionalMonthlyEuro += 2.8; // Default fallback
  }

  // Storage and Upgrades
  if (isContaboCloudPlan) {
    if (config.storage === `${planId}-storage-upgrade`) {
      const upgrade =
        CLOUD_VPS_STORAGE_UPGRADE_EUR[
          planId as keyof typeof CLOUD_VPS_STORAGE_UPGRADE_EUR
        ];
      if (upgrade) additionalMonthlyEuro += upgrade.eur;
    }
  } else if (planId === "20") {
    if (config.storage === "ssd-400") additionalMonthlyEuro += 3.9;
    if (config.storage === "nvme-200") additionalMonthlyEuro += 5.1;
  } else if (planId === "30") {
    if (config.storage === "ssd-800") additionalMonthlyEuro += 7.7;
    if (config.storage === "nvme-400") additionalMonthlyEuro += 6.5;
  } else if (planId === "50") {
    if (config.storage === "ssd-1200") additionalMonthlyEuro += 12.3;
    if (config.storage === "nvme-600") additionalMonthlyEuro += 9.5;
  } else if (
    planId === "s" ||
    planId === "m" ||
    planId === "l" ||
    planId === "xl" ||
    planId === "xxl"
  ) {
    const upgrades = config.storageUpgrades || {};
    const upgradePrices: Record<string, number> = {
      "ssd-1tb": 49.98,
      "ssd-2tb": 78.18,
      "ssd-4tb": 206.98,
    };
    Object.entries(upgrades).forEach(([id, qty]) => {
      additionalMonthlyEuro += (upgradePrices[id] || 0) * (qty as number);
    });
  } else {
    if (config.storage === "ssd-300") additionalMonthlyEuro += 3.1;
    if (config.storage === "nvme-150") additionalMonthlyEuro += 3.7;
  }

  // OS and Panels
  const tierOsPrices: Record<string, Record<string, number>> = {
    "10": {
      cpanel: 43.5,
      pleskHost: 73.0,
      pleskLinux: 24.0,
      pleskPro: 38.0,
      pleskWin: 32.0,
      windows: 15.0,
    },
    "20": {
      cpanel: 43.5,
      pleskHost: 73.0,
      pleskLinux: 24.0,
      pleskPro: 38.0,
      pleskWin: 32.0,
      windows: 31.0,
    },
    "30": {
      cpanel: 43.5,
      pleskHost: 73.0,
      pleskLinux: 24.0,
      pleskPro: 38.0,
      pleskWin: 73.0,
      windows: 52.0,
    },
    "40": {
      cpanel: 43.5,
      pleskHost: 73.0,
      pleskLinux: 24.0,
      pleskPro: 38.0,
      pleskWin: 73.0,
      windows: 98.0,
    },
    "50": {
      cpanel: 43.5,
      pleskHost: 73.0,
      pleskLinux: 24.0,
      pleskPro: 38.0,
      pleskWin: 73.0,
      windows: 117.0,
    },
    "60": {
      cpanel: 43.5,
      pleskHost: 73.0,
      pleskLinux: 24.0,
      pleskPro: 38.0,
      pleskWin: 73.0,
      windows: 140.0,
    },
    l: {
      cpanel: 43.5,
      pleskHost: 73.0,
      pleskLinux: 24.0,
      pleskPro: 38.0,
      pleskWin: 24.0,
      windows: 110.0,
    },
    m: {
      cpanel: 43.5,
      pleskHost: 73.0,
      pleskLinux: 24.0,
      pleskPro: 38.0,
      pleskWin: 24.0,
      windows: 100.0,
    },
    s: {
      cpanel: 43.5,
      pleskHost: 73.0,
      pleskLinux: 24.0,
      pleskPro: 38.0,
      pleskWin: 24.0,
      windows: 70.0,
    },
    xl: {
      cpanel: 43.5,
      pleskHost: 73.0,
      pleskLinux: 24.0,
      pleskPro: 38.0,
      pleskWin: 24.0,
      windows: 130.0,
    },
    xxl: {
      cpanel: 43.5,
      pleskHost: 73.0,
      pleskLinux: 24.0,
      pleskPro: 38.0,
      pleskWin: 24.0,
      windows: 150.0,
    },
  };

  const osPrices = isContaboCloudPlan
    ? {
        ...tierOsPrices["10"],
        windows:
          (WINDOWS_SERVER_EUR[planId as keyof typeof WINDOWS_SERVER_EUR] ?? 8) *
          2,
      }
    : tierOsPrices[planId] || tierOsPrices["10"];
  let resolvedImageKey = config.image || "ubuntu";
  if (resolvedImageKey === "plesk" || resolvedImageKey === "plesk-linux") {
    const lic = config.pleskLicence || "admin";
    resolvedImageKey =
      lic === "host" ? "pleskHost" : lic === "pro" ? "pleskPro" : "pleskLinux";
  } else if (resolvedImageKey === "plesk-win") resolvedImageKey = "pleskWin";

  let osEur = osPrices[resolvedImageKey] || 0;
  if (config.image === "cpanel") {
    const cpMap: Record<string, number> = {
      "5": 43.5,
      "30": 58.0,
      "50": 77.0,
      "100": 94.0,
      "150": 117.0,
      "200": 157.0,
      "250": 197.0,
      "300": 237.0,
      "500": 397.0,
      "1000": 797.0,
    };
    osEur = cpMap[config.cpanelLicence] || 43.5;
  }
  additionalMonthlyEuro += osEur;

  // Other Add-ons
  // Cloud VPS Core and VDS backup is already baked into monthlyEuro above (via
  // getCloudVpsMonthlyEuro/getVdsMonthlyEuro's backupEnabled param) — don't add it twice.
  if (isStorageVps && config.backup === "true") {
    const storageBackupEur: Record<string, number> = {
      "10": 3.0,
      "20": 4.0,
      "30": 7.0,
      "40": 8.4,
      "50": 9.8,
    };
    additionalMonthlyEuro += storageBackupEur[planId] || 0;
  } else if (isLegacyVpsPlan && config.backup === "true") {
    if (planId === "20") additionalMonthlyEuro += 4.0;
    else if (planId === "30") additionalMonthlyEuro += 6.0;
    else if (planId === "40") additionalMonthlyEuro += 10.0;
    else if (planId === "50") additionalMonthlyEuro += 15.0;
    else if (planId === "60") additionalMonthlyEuro += 19.0;
    else additionalMonthlyEuro += 3.0;
  }
  if (config.privateNetwork === "enabled") additionalMonthlyEuro += 4.58;
  if (config.ipv4Address === "2ip") additionalMonthlyEuro += 7.0;

  if (config.objectStorage && config.objectStorage !== "none") {
    const objPrices: Record<string, number> = {
      "1tb": 19.92,
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
    };
    additionalMonthlyEuro += objPrices[config.objectStorage] || 0;
  }

  if (config.management === "managed") additionalMonthlyEuro += 219.98;
  if (config.monitoring === "full") additionalMonthlyEuro += 22.98;

  // Per-item EUR breakdown for WhatsApp notification accuracy
  const _pbd_location = (() => {
    if (isContaboCloudPlan) {
      const local =
        CLOUD_VPS_LOCATION_EUR[planId as keyof typeof CLOUD_VPS_LOCATION_EUR] ||
        {};
      return local[config.location] ?? 0;
    }
    const planLocPricesLocal = locationPrices[planId] || {};
    if (planLocPricesLocal[config.location] !== undefined)
      return planLocPricesLocal[config.location];
    if (
      config.location &&
      config.location !== "eu" &&
      config.location !== "best"
    )
      return 2.8;
    return 0;
  })();
  const _pbd_storage = (() => {
    if (isContaboCloudPlan) {
      if (config.storage !== `${planId}-storage-upgrade`) return 0;
      const upgrade =
        CLOUD_VPS_STORAGE_UPGRADE_EUR[
          planId as keyof typeof CLOUD_VPS_STORAGE_UPGRADE_EUR
        ];
      return upgrade?.eur ?? 0;
    }
    if (planId === "20") {
      if (config.storage === "ssd-400") return 3.9;
      if (config.storage === "nvme-200") return 5.1;
    } else if (planId === "30") {
      if (config.storage === "ssd-800") return 7.7;
      if (config.storage === "nvme-400") return 6.5;
    } else if (planId === "50") {
      if (config.storage === "ssd-1200") return 12.3;
      if (config.storage === "nvme-600") return 9.5;
    } else if (["s", "m", "l", "xl", "xxl"].includes(planId)) {
      const upgrades = config.storageUpgrades || {};
      const up: Record<string, number> = {
        "ssd-1tb": 49.98,
        "ssd-2tb": 78.18,
        "ssd-4tb": 206.98,
      };
      return Object.entries(upgrades).reduce(
        (s, [id, q]) => s + (up[id] || 0) * (q as number),
        0
      );
    } else {
      if (config.storage === "ssd-300") return 3.1;
      if (config.storage === "nvme-150") return 3.7;
    }
    return 0;
  })();
  const _pbd_backup =
    isStorageVps && config.backup === "true"
      ? (
          { "10": 3.0, "20": 4.0, "30": 7.0, "40": 8.4, "50": 9.8 } as Record<
            string,
            number
          >
        )[planId] || 0
      : isLegacyVpsPlan && config.backup === "true"
        ? planId === "20"
          ? 4.0
          : planId === "30"
            ? 6.0
            : planId === "40"
              ? 10.0
              : planId === "50"
                ? 15.0
                : planId === "60"
                  ? 19.0
                  : 3.0
        : 0;
  const _pbd_network = config.privateNetwork === "enabled" ? 4.58 : 0;
  const _pbd_ip = config.ipv4Address === "2ip" ? 7.0 : 0;
  const _pbd_objectStorage = (() => {
    if (!config.objectStorage || config.objectStorage === "none") return 0;
    const op: Record<string, number> = {
      "1tb": 19.92,
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
    };
    return op[config.objectStorage] || 0;
  })();
  const _pbd_managed = config.management === "managed" ? 219.98 : 0;
  const _pbd_monitoring = config.monitoring === "full" ? 22.98 : 0;

  const priceBreakdown = {
    additionalIpBrlPerMonth: _pbd_ip * RATE,
    backupBrlPerMonth: _pbd_backup * RATE,
    baseBrlPerMonth: monthlyEuro * RATE,
    eurRate: RATE,
    imageBrlPerMonth: osEur * RATE,
    locationBrlPerMonth: _pbd_location * RATE,
    managedBrlPerMonth: _pbd_managed * RATE,
    monitoringBrlPerMonth: _pbd_monitoring * RATE,
    objectStorageBrlPerMonth: _pbd_objectStorage * RATE,
    privateNetworkBrlPerMonth: _pbd_network * RATE,
    setupBrl,
    storageBrlPerMonth: _pbd_storage * RATE,
  };

  const totalMonthlyBrl = (monthlyEuro + additionalMonthlyEuro) * RATE;
  const qty = Number.parseInt(config.qty || "1", 10);

  let finalAmountBrl = totalMonthlyBrl * duration * qty + setupBrl * qty;

  // Override final price for payment testing
  if (process.env.VPS_TEST_PRICE) {
    const testPrice = Number.parseFloat(process.env.VPS_TEST_PRICE);
    if (!Number.isNaN(testPrice) && testPrice > 0) {
      console.log(
        `[VPS] ⚠️ VPS_TEST_PRICE ativo: substituindo R$ ${finalAmountBrl.toFixed(2)} → R$ ${testPrice.toFixed(2)}`
      );
      finalAmountBrl = testPrice;
    }
  }

  try {
    const description = `Hospedagem VPS ${planId} (${duration} ${duration === 1 ? "mês" : "meses"})`;

    const [newInvoice] = await db
      .insert(pgInvoice)
      .values({
        amount: finalAmountBrl,
        currency: "BRL",
        description,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        metadata: {
          config,
          guestCheckout: isGuestCheckout || undefined,
          guestPassword: guestPassword || undefined,
          priceBreakdown,
          vpsId: planId,
        },
        orgId: user.organization.id,
        reference: `VPS-${planId}-${Date.now()}`,
        status: "pending",
        type: "vps",
        userId: user.id,
      })
      .returning();

    if (!newInvoice) throw new Error("Erro ao criar fatura.");

    return {
      invoiceId: newInvoice.id,
      redirectUrl: `/checkout/${newInvoice.id}?initialStep=payment`,
      status: "success",
    };
  } catch (error) {
    console.error("Error creating VPS invoice:", error);
    return { message: "Erro ao processar o pedido.", status: "error" };
  }
}

export async function createVpsRenewalInvoice(
  subscriptionId: string
): Promise<
  | { status: "success"; redirectUrl: string }
  | { status: "error"; message: string }
> {
  const user = await getUser();
  if (!user) return { message: "Usuário não autenticado.", status: "error" };

  const sub = await db.query.pgVpsSubscription.findFirst({
    where: eq(pgVpsSubscription.id, subscriptionId),
  });
  if (!sub) return { message: "Assinatura não encontrada.", status: "error" };

  const isOwner = sub.userId === user.id;
  if (!isOwner && !user.isAdmin) {
    return {
      message: "Sem permissão para renovar esta assinatura.",
      status: "error",
    };
  }

  if (sub.paymentMethod !== "pix" && sub.paymentMethod !== "boleto") {
    return {
      message:
        "Renovação manual disponível apenas para assinaturas PIX ou boleto.",
      status: "error",
    };
  }

  // Elegível quando a vencer (≤15 dias) ou já pausada/vencida.
  const fifteenDaysMs = 15 * 24 * 60 * 60 * 1000;
  const dueSoon = sub.nextChargeDate.getTime() <= Date.now() + fifteenDaysMs;
  const isPaused = sub.status === "paused";
  if (!dueSoon && !isPaused) {
    return {
      message: "Renovação ainda não disponível para esta assinatura.",
      status: "error",
    };
  }

  try {
    const config = sub.config as any;
    const [newInvoice] = await db
      .insert(pgInvoice)
      .values({
        amount: sub.amountBrl,
        currency: "BRL",
        description: `Renovação VPS ${sub.planId} — ${sub.intervalMonths} ${sub.intervalMonths === 1 ? "mês" : "meses"}`,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        metadata: {
          config,
          isRenewal: true,
          subscriptionId: sub.id,
          vpsId: sub.planId,
        } as any,
        orgId: sub.orgId,
        reference: `VPS-REN-${sub.planId}-${Date.now()}`,
        status: "pending",
        type: "vps",
        userId: sub.userId,
      })
      .returning();

    if (!newInvoice) throw new Error("Falha ao criar fatura de renovação.");

    return {
      redirectUrl: `/checkout/${newInvoice.id}?initialStep=payment`,
      status: "success",
    };
  } catch (error) {
    console.error("Error creating VPS renewal invoice:", error);
    return { message: "Erro ao gerar a renovação.", status: "error" };
  }
}
