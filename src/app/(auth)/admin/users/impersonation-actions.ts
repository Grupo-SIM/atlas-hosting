"use server";

import { getRealUser, loadFullUserById } from "@/lib/auth";
import { IMPERSONATE_COOKIE } from "@/lib/auth/impersonation";
import { AppLogger } from "@/lib/server/logs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const MAX_AGE_SECONDS = 60 * 60 * 2; // 2h

/**
 * Inicia "Acessar como cliente". Requer admin real. Auditável: registra no log
 * do admin E na conta do cliente (não escondemos o acesso do dono da conta).
 */
export async function startImpersonationAction(targetUserId: string): Promise<void> {
  const admin = await getRealUser();
  if (!admin.isAdmin) redirect("/home");

  if (!targetUserId || targetUserId === admin.id) {
    redirect("/admin/users");
  }

  const target = await loadFullUserById(targetUserId);
  if (!target) redirect("/admin/users");

  // Segurança: não permitimos impersonar outro admin.
  if (target.isAdmin) redirect("/admin/users");

  // Auditoria — no admin (rastro de quem acessou) e no cliente (transparência).
  new AppLogger(admin).log({
    title: "Impersonação iniciada",
    description: `Admin ${admin.email} acessou a conta de ${target.email} (id ${target.id}).`,
    severity: "warning",
    type: "security",
  });
  new AppLogger(target).log({
    title: "Acesso administrativo à sua conta",
    description: `Um administrador (${admin.email}) acessou sua conta para suporte.`,
    severity: "info",
    type: "security",
  });

  const cookieStore = await cookies();
  cookieStore.set(IMPERSONATE_COOKIE, target.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });

  redirect("/home");
}

/** Encerra a impersonação e volta para a conta do admin. */
export async function stopImpersonationAction(): Promise<void> {
  const cookieStore = await cookies();
  const targetId = cookieStore.get(IMPERSONATE_COOKIE)?.value;

  // getRealUser ignora a impersonação: retorna o admin de verdade.
  const admin = await getRealUser();

  if (targetId) {
    new AppLogger(admin).log({
      title: "Impersonação encerrada",
      description: `Admin ${admin.email} saiu da conta impersonada (id ${targetId}).`,
      severity: "info",
      type: "security",
    });
  }

  cookieStore.delete(IMPERSONATE_COOKIE);
  redirect("/admin/users");
}
