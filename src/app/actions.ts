"use server";

import {
  authenticateUser,
  createSession,
  createUser,
  generateSessionToken,
  getUser,
} from "@/lib/auth/index";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SignupFormInputs } from "@/components/auth/SignupForm";
import { LoginFormInputs } from "@/components/auth/LoginForm";
import { CheckoutFormInputs } from "@/components/checkout/CheckoutForm";
import nameSilo from "@/lib/server/apis/namesilo";
import { db } from "@/lib/db";
import { invoiceTable, sessionTable, userTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NamesiloBoolean } from "@/lib/server/apis/namesilo/types";

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
  { address, cardCvv, cardExpiration, cardNumber, cardToken, document, fullName, phoneNumber, invoiceId }: CheckoutFormInputs
): Promise<ActionResponse> {
  const user = await getUser();

  if (!user) {
    return { status: "error", message: "Usuário não autenticado" };
  }

  if (!user.namesiloId) {
    const contactId = await nameSilo.createContact({
      fn: fullName.split(" ")[0],
      ln: fullName.split(" ").slice(1).join(" "),
      ad: [address.street, address.number, address.city, address.state, address.zipCode].join(" "),
      ct: address.city,
      cy: address.state,
      zp: address.zipCode,
      ph: phoneNumber,
      em: user.email,
      st: address.state,    
    });

    user.namesiloId = contactId;

    await db.update(userTable).set({
      namesiloId: contactId,
    }).where(eq(userTable.id, user.id));
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
    contact_id: user.namesiloId,
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

export interface ActionResponse {
  status: "idle" | "success" | "error";
  message?: string;
}
