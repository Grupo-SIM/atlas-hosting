"use server";

import { FORBIDDEN_MESSAGE, getBuilderUser } from "@/lib/site-builder/access";
import {
  isWorkerConfigured,
  workerDisconnect,
  workerFinishLogin,
  workerStartLogin,
  workerStatus,
} from "@/lib/site-builder/ai/worker";

/** Estado da conexão Claude do usuário (assinatura dele, guardada no claude-worker). */
export type AiStatusResult =
  | { available: false }
  | { available: true; connected: false }
  | { available: true; connected: true; email?: string; plan?: string };

interface Failure {
  error: string;
  ok: false;
}

const UNAVAILABLE =
  "Não foi possível falar com o servidor da IA. Tente de novo em instantes.";

export async function getAiStatus(): Promise<AiStatusResult | Failure> {
  const user = await getBuilderUser();
  if (!user) return { error: FORBIDDEN_MESSAGE, ok: false };
  if (!isWorkerConfigured()) return { available: false };
  try {
    const status = await workerStatus(user.id);
    return status.connected
      ? {
          available: true,
          connected: true,
          email: status.email,
          plan: status.plan,
        }
      : { available: true, connected: false };
  } catch (error) {
    console.error("[Atlas IA] status", error);
    return { error: UNAVAILABLE, ok: false };
  }
}

export async function startAiLogin(): Promise<
  { loginId: string; ok: true; url: string } | Failure
> {
  const user = await getBuilderUser();
  if (!user) return { error: FORBIDDEN_MESSAGE, ok: false };
  try {
    return { ok: true, ...(await workerStartLogin(user.id)) };
  } catch (error) {
    console.error("[Atlas IA] iniciar login", error);
    return {
      error: error instanceof Error ? error.message : UNAVAILABLE,
      ok: false,
    };
  }
}

export async function finishAiLogin(
  loginId: string,
  code: string
): Promise<{ email?: string; ok: true; plan?: string } | Failure> {
  const user = await getBuilderUser();
  if (!user) return { error: FORBIDDEN_MESSAGE, ok: false };
  if (!code.trim())
    return { error: "Cole o código que o Claude mostrou.", ok: false };
  try {
    const status = await workerFinishLogin(user.id, loginId, code);
    if (!status.connected) {
      return {
        error: "O código não foi aceito. Gere um link novo e tente de novo.",
        ok: false,
      };
    }
    return { email: status.email, ok: true, plan: status.plan };
  } catch (error) {
    console.error("[Atlas IA] concluir login", error);
    return {
      error: error instanceof Error ? error.message : UNAVAILABLE,
      ok: false,
    };
  }
}

export async function disconnectAi(): Promise<{ ok: true } | Failure> {
  const user = await getBuilderUser();
  if (!user) return { error: FORBIDDEN_MESSAGE, ok: false };
  try {
    await workerDisconnect(user.id);
    return { ok: true };
  } catch (error) {
    console.error("[Atlas IA] desconectar", error);
    return { error: UNAVAILABLE, ok: false };
  }
}
