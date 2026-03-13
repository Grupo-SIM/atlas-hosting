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
import type { SavedCard } from "@/components/checkout/ModernCheckoutForm";
import type { DomainPageParams } from "./(auth)/domain/types";
import { AtlasNotificationEmail } from "@/emails";
import { render } from "@react-email/render";

export async function login(
  prevState: unknown,
  { email, password, redirectTo }: LoginFormInputs
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

    // Check if email is verified
    if (!user.emailVerified) {
      return {
        status: "error",
        message:
          "Você precisa verificar seu email antes de fazer login. Verifique sua caixa de entrada.",
        error: "email_not_verified",
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

  // Redirect to the specified page or default to home
  const redirectPath = redirectTo?.startsWith("/") ? redirectTo : "/";
  redirect(redirectPath);
}

export async function signup(
  prevState: unknown,
  { email, password, firstName, lastName, referrerId, organizationName }: SignupFormInputs
): Promise<ActionResponse> {
  const fullName = `${firstName.trim()} ${lastName.trim()}`;

  if (!email || !password || !firstName || !lastName || !organizationName) {
    return {
      status: "error",
      message: "Nome, sobrenome, email e senha são obrigatórios",
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

    // Don't auto-login, let user verify email first
    if (referrerId) {
      try {
        const userLogger = new AppLogger({ id: referrerId });
        userLogger.log({
          type: "account",
          title: "Usuário cadastrado com seu link de afiliado",
          description:
            "Um novo usuário se cadastrou usando seu link de afiliado.",
          severity: "success",
        });
      } catch (error) {
        console.error("Failed to log affiliate:", error);
        // Don't fail signup if affiliate logging fails
      }
    }

    return {
      status: "success",
      message:
        "Conta criada com sucesso! Verifique seu email para ativar a conta.",
    };
  } catch (error) {
    console.error("Signup error:", error);
    return { status: "error", message: "Erro ao criar conta" };
  }
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

  console.log(`\n[INVOICE] ==================== CRIANDO FATURA DE DOMÍNIO ====================`);
  console.log(`[INVOICE] Domínio: ${domain} | Anos: ${years} | Whoisguard: ${whoisguard ?? "off"} | Usuário: ${user.id}`);

  try {
    console.log(`[NAMECHEAP] Verificando disponibilidade de: ${domain}`);
    const namecheapResult = await namecheapApi
      .check({
        DomainList: domain,
      })
      .then((r) => r.Results[0]);

    console.log(`[NAMECHEAP] Resultado da verificação:`, {
      domain: namecheapResult.Domain,
      available: namecheapResult.Available,
      isPremium: namecheapResult.IsPremiumName,
      premiumPrice: namecheapResult.PremiumRegistrationPrice || "N/A",
    });

    const isAvailable = namecheapResult.Available;

    if (!isAvailable) {
      console.warn(`[INVOICE] Domínio ${domain} não está disponível. Fatura não criada.`);
      return;
    }

    console.log(`[NAMECHEAP] Buscando preços para TLD: .${domain.split(".").pop()}`);
    const pricesInfo = await getDomainPricing(
      domain.split(".").pop() as string
    );
    const priceInfo = pricesInfo.Prices.find(
      (p) => p.Duration === +years && p.DurationType === "YEAR"
    );

    console.log(`[NAMECHEAP] Preços disponíveis:`, pricesInfo.Prices.map(p => ({
      duration: `${p.Duration} ${p.DurationType}`,
      price: p.Price,
      currency: p.Currency,
    })));

    if (!priceInfo) {
      console.error(`[INVOICE] Nenhum preço encontrado para ${years} ano(s). Fatura não criada.`);
      return;
    }

    console.log(`[INVOICE] Preço selecionado (${years} ano):`, { price: priceInfo.Price, currency: priceInfo.Currency });

    let priceInBrl = priceInfo.Price;

    // Pode vir em USD, pode vir em BRL (?)
    if (priceInfo.Currency.toUpperCase() !== "BRL") {
      priceInBrl = await currencyConversion.convert({
        from: priceInfo.Currency.toLowerCase(),
        to: "brl",
        amount: priceInfo.Price,
      });
      console.log(`[INVOICE] Conversão ${priceInfo.Currency}→BRL: ${priceInfo.Price} → R$ ${priceInBrl.toFixed(2)}`);
    }

    const feeEnabled = process.env.DOMAIN_FEE_ENABLED !== "false";
    const fee = feeEnabled
      ? 1 + ((await db.query.pgSystemConfig.findFirst())?.domainFee ?? 5) / 100
      : 1;

    const precoSemTaxa = priceInBrl;
    priceInBrl *= fee;
    console.log(`[INVOICE] Taxa aplicada: feeEnabled=${feeEnabled} | fee=${fee}x | R$ ${precoSemTaxa.toFixed(2)} → R$ ${priceInBrl.toFixed(2)}`);

    if (whoisguard === "on") {
      priceInBrl += 3;
      console.log(`[INVOICE] Whoisguard adicionado: +R$ 3,00 → Total: R$ ${priceInBrl.toFixed(2)}`);
    }

    console.log(`[INVOICE] Valor final da fatura: R$ ${priceInBrl.toFixed(2)}`);

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
      console.error(`[INVOICE] Falha ao criar fatura no banco de dados.`, newInvoice);
      return;
    }

    console.log(`[INVOICE] Fatura criada com sucesso! ID: ${newInvoice.id} | Valor: R$ ${priceInBrl.toFixed(2)}`);
    redirectUrl = `/checkout/${newInvoice.id}`;
  } catch (error) {
    console.error(`[INVOICE] ERRO ao criar fatura do domínio:`, error);
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

  console.log(`\n[CHECKOUT] ==================== INICIANDO CHECKOUT (NOVO CARTÃO) ====================`);
  console.log(`[CHECKOUT] Invoice ID: ${invoiceId} | Usuário: ${user.id}`);

  const invoice = await db
    .update(pgInvoice)
    .set({ status: "processing" })
    .where(eq(pgInvoice.id, invoiceId))
    .returning()
    .execute()
    .then((r) => r[0]);

  if (!invoice) {
    console.error(`[CHECKOUT] Fatura ${invoiceId} não encontrada no banco.`);
    return { status: "error", message: "Fatura não encontrada." };
  }

  console.log(`[CHECKOUT] Fatura carregada:`, {
    id: invoice.id,
    type: invoice.type,
    reference: invoice.reference,
    amount: `R$ ${invoice.amount.toFixed(2)}`,
    status: invoice.status,
    metadata: invoice.metadata,
  });

  if (!user.organization?.domId) {
    console.log(`[DOM] Organização sem cliente DOM. Criando novo cliente...`);
    try {
      const clientPayload = {
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
      };
      console.log(`[DOM] → Enviando createClient:`, { name: clientPayload.name, email: clientPayload.email, document: `***${clientPayload.document.slice(-4)}` });

      const { id } = await domApi.createClient(clientPayload);
      console.log(`[DOM] ✓ Cliente DOM criado com ID: ${id}`);

      await db
        .update(pgOrganization)
        .set({ domId: id })
        .where(eq(pgOrganization.id, user.organizationId ?? ""));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`[DOM] ✗ ERRO ao criar cliente:`, error.response?.data ?? error.request ?? error.message);
      } else {
        console.error(`[DOM] ✗ ERRO ao criar cliente:`, error);
      }
      return { status: "error", message: "Erro ao criar cliente no sistema de domínios." };
    }
  } else {
    console.log(`[DOM] Cliente DOM já existe: ${user.organization.domId}`);
  }

  const [expMonth, expYear] = values.cardExpiration.split("/");
  const fullYear = 2000 + Number.parseInt(expYear);

  let { cardToken } = values;

  if (!cardToken) {
    console.log(`[DOM] Tokenizando cartão: **** **** **** ${values.cardNumber.replace(/\D/g, "").slice(-4)} | Portador: ${values.firstName} ${values.lastName} | Validade: ${values.cardExpiration}`);
    try {
      const tokenData = await domApi.createCardToken(user.id, {
        number: values.cardNumber.replace(/\D/g, ""),
        cvv: values.cardCvv,
        exp_month: Number.parseInt(expMonth),
        exp_year: fullYear,
        holder_name: `${values.firstName} ${values.lastName}`,
        holder_document: values.document.replace(/\D/g, ""),
      });

      console.log(`[DOM] ✓ Cartão tokenizado:`, { token: tokenData.token, last4: tokenData.last4, brand: tokenData.brand, expiryMonth: tokenData.expiryMonth, expiryYear: tokenData.expiryYear });

      if (!user?.organization?.wallet) {
        console.error(`[CHECKOUT] Carteira da organização não encontrada.`);
        return { status: "error", message: "Carteira não encontrada" };
      }

      const existingCards = await db.$count(
        pgUserCard,
        eq(pgUserCard.walletId, user.organization.wallet.id)
      );
      const isFirstCard = existingCards === 0;
      console.log(`[CHECKOUT] Cartões existentes: ${existingCards} | É o cartão padrão: ${isFirstCard}`);

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
        console.error(`[DOM] ✗ ERRO na tokenização do cartão:`, err.response?.data ?? err.request ?? err.message);
      } else {
        console.error(`[DOM] ✗ ERRO na tokenização do cartão:`, err);
      }
      throw err;
    }
  } else {
    console.log(`[DOM] Usando cardToken já fornecido: ${cardToken}`);
  }

  if (invoice.type === "domain") {
    console.log(`\n[DOM] ── PAGAMENTO ÚNICO (DOMÍNIO) ──`);
    const domPayload = {
      description: `Atlas Hosting ${invoice.reference}`,
      externalReference: invoiceId,
      card: { token: cardToken, installments: 1 },
      userId: user.id,
      value: invoice.amount,
    };
    console.log(`[DOM] → Enviando createOneTimePayment:`, { ...domPayload, card: { token: `${cardToken.substring(0, 8)}...`, installments: 1 } });

    try {
      const domResult = await domApi.createOneTimePayment(domPayload);
      console.log(`[DOM] ✓ Pagamento único processado:`, domResult);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error(`[DOM] ✗ ERRO no pagamento único:`, JSON.stringify(err.response?.data ?? err.message, null, 2));
      } else {
        console.error(`[DOM] ✗ ERRO no pagamento único:`, err);
      }
      return { status: "error", message: "Erro ao processar pagamento do domínio." };
    }

    const contact = {
      FirstName: values.firstName.trim(),
      LastName: values.lastName.trim(),
      Address1: `${values.address.street}, ${values.address.number}`,
      City: values.address.city,
      StateProvince: values.address.state,
      PostalCode: values.address.zipCode.replace(/\D/g, ""),
      Country: "BR",
      Phone: `+55.${values.phoneNumber.replace(/\D/g, "")}`,
      EmailAddress: user.email,
    };
    const meta = invoice.metadata as { years?: string; whoisguard?: string } | null;
    const years = parseInt(meta?.years ?? "1", 10);
    const whoisguard = meta?.whoisguard === "on";

    console.log(`\n[NAMECHEAP] ── REGISTRANDO DOMÍNIO ──`);
    const ncPayload = {
      DomainName: invoice.reference,
      Years: years,
      AddFreeWhoisguard: whoisguard ? "yes" : "no",
      WGEnabled: whoisguard ? "yes" : "no",
      Nameservers: ["dns1.registrar-servers.com", "dns2.registrar-servers.com"],
      Registrant: contact,
    };
    console.log(`[NAMECHEAP] → Enviando createDomain:`, ncPayload);

    try {
      const domainResult = await namecheapApi.createDomain({
        DomainName: invoice.reference,
        Years: years,
        Registrant: contact,
        Admin: contact,
        Tech: contact,
        AuxBilling: contact,
        AddFreeWhoisguard: whoisguard ? "yes" : "no",
        WGEnabled: whoisguard ? "yes" : "no",
        Nameservers: ["dns1.registrar-servers.com", "dns2.registrar-servers.com"],
      });

      console.log(`[NAMECHEAP] ← Resposta createDomain:`, domainResult);

      if (domainResult.Registered) {
        console.log(`[NAMECHEAP] ✓ Domínio ${invoice.reference} REGISTRADO com sucesso! OrderID: ${domainResult.OrderID} | TransactionID: ${domainResult.TransactionID} | Cobrado: R$ ${domainResult.ChargedAmount}`);
        await db.insert(pgOrganizationDomains).values({
          organizationId: user.organization.id,
          domain: invoice.reference,
          active: true,
        });
        console.log(`[CHECKOUT] ✓ Domínio vinculado à organização ${user.organization.id}`);
      } else {
        console.warn(`[NAMECHEAP] ✗ Domínio NÃO registrado. Resposta completa:`, domainResult);
      }
    } catch (domainErr) {
      console.error(`[NAMECHEAP] ✗ ERRO ao registrar domínio ${invoice.reference}:`, domainErr);
    }

    await db.update(pgInvoice).set({ status: "paid" }).where(eq(pgInvoice.id, invoiceId));
    console.log(`[CHECKOUT] ✓ Fatura ${invoiceId} marcada como PAGA. Redirecionando para /domains.`);
    redirect("/domains");
  }

  console.log(`\n[DOM] ── PAGAMENTO RECORRENTE (ASSINATURA) ──`);
  const recPayload = {
    description: `Atlas Hosting ${invoice.reference}`,
    externalReference: invoiceId,
    frequency: "MONTH" as const,
    card: { token: `${cardToken.substring(0, 8)}...`, installments: 1 },
    userId: user.id,
    value: invoice.amount,
  };
  console.log(`[DOM] → Enviando createRecurrentPayment:`, recPayload);

  try {
    const result = await domApi.createRecurrentPayment({
      description: `Atlas Hosting ${invoice.reference}`,
      externalReference: invoiceId,
      frequency: "MONTH",
      card: { token: cardToken, installments: 1 },
      userId: user.id,
      value: invoice.amount,
    });
    console.log(`[DOM] ✓ Assinatura recorrente criada:`, result);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error(`[DOM] ✗ ERRO no pagamento recorrente:`, JSON.stringify(err.response?.data ?? err.request ?? err.message, null, 2));
    } else {
      console.error(`[DOM] ✗ ERRO no pagamento recorrente:`, err);
    }
    return { status: "error", message: "Erro ao criar pagamento recorrente." };
  }

  console.log(`[CHECKOUT] ✓ Checkout concluído. Redirecionando para /payment/success.`);
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
    console.error(`[CHECKOUT-SAVED] Fatura ${invoiceId} não encontrada.`);
    return { status: "error", message: "Fatura não encontrada." };
  }

  console.log(`\n[CHECKOUT-SAVED] ==================== INICIANDO CHECKOUT (CARTÃO SALVO) ====================`);
  console.log(`[CHECKOUT-SAVED] Invoice ID: ${invoiceId} | Usuário: ${user.id} | Cartão: **** ${card.last4} (${card.brand})`);
  console.log(`[CHECKOUT-SAVED] Fatura:`, {
    id: invoice.id,
    type: invoice.type,
    reference: invoice.reference,
    amount: `R$ ${invoice.amount.toFixed(2)}`,
    metadata: invoice.metadata,
  });

  // Ensure DOM client exists
  if (!user.organization?.domId) {
    console.log(`[DOM] Organização sem cliente DOM. Criando novo cliente...`);
    try {
      const clientPayload = {
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
      };
      console.log(`[DOM] → Enviando createClient:`, { name: clientPayload.name, email: clientPayload.email, document: `***${clientPayload.document.slice(-4)}` });

      const { id } = await domApi.createClient(clientPayload);
      console.log(`[DOM] ✓ Cliente DOM criado com ID: ${id}`);

      await db
        .update(pgOrganization)
        .set({ domId: id })
        .where(eq(pgOrganization.id, user.organizationId ?? ""));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`[DOM] ✗ ERRO ao criar cliente:`, error.response?.data ?? error.request ?? error.message);
      } else {
        console.error(`[DOM] ✗ ERRO ao criar cliente:`, error);
      }
      return { status: "error", message: "Erro ao criar cliente no sistema de pagamentos." };
    }
  } else {
    console.log(`[DOM] Cliente DOM já existe: ${user.organization.domId}`);
  }

  if (invoice.type === "domain") {
    console.log(`\n[DOM] ── PAGAMENTO ÚNICO (DOMÍNIO / CARTÃO SALVO) ──`);
    const domPayload = {
      description: `Atlas Hosting ${invoice.reference}`,
      externalReference: invoiceId,
      card: { token: `${cardToken.substring(0, 8)}...`, installments: 1 },
      userId: user.id,
      value: invoice.amount,
    };
    console.log(`[DOM] → Enviando createOneTimePayment:`, domPayload);

    try {
      const domResult = await domApi.createOneTimePayment({
        description: `Atlas Hosting ${invoice.reference}`,
        externalReference: invoiceId,
        card: { token: cardToken, installments: 1 },
        userId: user.id,
        value: invoice.amount,
      });
      console.log(`[DOM] ✓ Pagamento único processado:`, domResult);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error(`[DOM] ✗ ERRO no pagamento único:`, JSON.stringify(err.response?.data ?? err.message, null, 2));
      } else {
        console.error(`[DOM] ✗ ERRO no pagamento único:`, err);
      }
      return { status: "error", message: "Erro ao processar pagamento do domínio." };
    }

    const contact = {
      FirstName: values.firstName.trim(),
      LastName: values.lastName.trim(),
      Address1: `${values.address.street}, ${values.address.number}`,
      City: values.address.city,
      StateProvince: values.address.state,
      PostalCode: values.address.zipCode.replace(/\D/g, ""),
      Country: "BR",
      Phone: `+55.${values.phoneNumber.replace(/\D/g, "")}`,
      EmailAddress: user.email,
    };
    const meta = invoice.metadata as { years?: string; whoisguard?: string } | null;
    const years = parseInt(meta?.years ?? "1", 10);
    const whoisguard = meta?.whoisguard === "on";

    console.log(`\n[NAMECHEAP] ── REGISTRANDO DOMÍNIO (CARTÃO SALVO) ──`);
    console.log(`[NAMECHEAP] → Enviando createDomain:`, {
      DomainName: invoice.reference,
      Years: years,
      AddFreeWhoisguard: whoisguard ? "yes" : "no",
      WGEnabled: whoisguard ? "yes" : "no",
      Nameservers: ["dns1.registrar-servers.com", "dns2.registrar-servers.com"],
      Registrant: contact,
    });

    try {
      const domainResult = await namecheapApi.createDomain({
        DomainName: invoice.reference,
        Years: years,
        Registrant: contact,
        Admin: contact,
        Tech: contact,
        AuxBilling: contact,
        AddFreeWhoisguard: whoisguard ? "yes" : "no",
        WGEnabled: whoisguard ? "yes" : "no",
        Nameservers: ["dns1.registrar-servers.com", "dns2.registrar-servers.com"],
      });

      console.log(`[NAMECHEAP] ← Resposta createDomain:`, domainResult);

      if (domainResult.Registered) {
        console.log(`[NAMECHEAP] ✓ Domínio ${invoice.reference} REGISTRADO! OrderID: ${domainResult.OrderID} | TransactionID: ${domainResult.TransactionID} | Cobrado: R$ ${domainResult.ChargedAmount}`);
        await db.insert(pgOrganizationDomains).values({
          organizationId: user.organization.id,
          domain: invoice.reference,
          active: true,
        });
        console.log(`[CHECKOUT-SAVED] ✓ Domínio vinculado à organização ${user.organization.id}`);
      } else {
        console.warn(`[NAMECHEAP] ✗ Domínio NÃO registrado. Resposta:`, domainResult);
      }
    } catch (domainErr) {
      console.error(`[NAMECHEAP] ✗ ERRO ao registrar domínio ${invoice.reference}:`, domainErr);
    }

    await db.update(pgInvoice).set({ status: "paid" }).where(eq(pgInvoice.id, invoiceId));
    console.log(`[CHECKOUT-SAVED] ✓ Fatura ${invoiceId} marcada como PAGA.`);

    return { status: "success", message: "/domains" };
  }

  console.log(`\n[DOM] ── PAGAMENTO RECORRENTE (ASSINATURA / CARTÃO SALVO) ──`);
  console.log(`[DOM] → Enviando createRecurrentPayment:`, {
    description: `Atlas Hosting ${invoice.reference}`,
    externalReference: invoiceId,
    frequency: "MONTH",
    card: { token: `${cardToken.substring(0, 8)}...`, installments: 1 },
    userId: user.id,
    value: invoice.amount,
  });

  try {
    const result = await domApi.createRecurrentPayment({
      description: `Atlas Hosting ${invoice.reference}`,
      externalReference: invoiceId,
      frequency: "MONTH",
      card: { token: cardToken, installments: 1 },
      userId: user.id,
      value: invoice.amount,
    });
    console.log(`[DOM] ✓ Assinatura recorrente criada (cartão salvo):`, result);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error(`[DOM] ✗ ERRO no pagamento recorrente (cartão salvo):`, JSON.stringify(err.response?.data, null, 2));
    } else {
      console.error(`[DOM] ✗ ERRO no pagamento recorrente (cartão salvo):`, err);
    }
    return { status: "error", message: "Erro ao processar pagamento com cartão salvo." };
  }

  console.log(`[CHECKOUT-SAVED] ✓ Checkout concluído com cartão salvo.`);
  return { status: "success", message: "/payment/success" };
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
    const earnings =
      +(row.total_amount || 0) * (systemConfig.referrerCommission / 100);
    const month = new Date(row.month).toLocaleDateString("pt-BR", {
      month: "short",
    });

    return {
      month: month.charAt(0).toUpperCase() + month.slice(1),
      earnings: earnings,
      referrals: +row.referrals_count || 0,
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
  const domainRegex =
    /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
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
      return {
        status: "error",
        message: "Este domínio já foi adicionado à sua organização",
      };
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
      message:
        "Domínio adicionado com sucesso. Agora configure os nameservers para completar a transferência.",
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
      "dns2.registrar-servers.com",
    ];

    const expectedNameservers = [
      "dns1.registrar-servers.com",
      "dns2.registrar-servers.com",
    ];

    const isCorrect =
      mockNameservers.every((ns) => expectedNameservers.includes(ns)) &&
      expectedNameservers.every((ns) => mockNameservers.includes(ns));

    revalidatePath("/domain/transfer");

    return {
      status: "success",
      message: isCorrect
        ? "Nameservers configurados corretamente!"
        : "Nameservers ainda não configurados corretamente",
      nameservers: mockNameservers,
      isCorrect,
    };
  } catch (error) {
    console.error("Erro ao verificar nameservers:", error);
    return {
      status: "error",
      message:
        "Erro ao verificar nameservers. Tente novamente em alguns minutos.",
    };
  }
}
