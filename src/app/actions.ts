"use server";

import {
  authenticateUser,
  createSession,
  createUser,
  generateSessionToken,
} from "@/lib/auth/index";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SignupFormInputs } from "@/components/auth/SignupForm";
import { LoginFormInputs } from "@/components/auth/LoginForm";

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

export interface ActionResponse {
  status: "idle" | "success" | "error";
  message?: string;
}
