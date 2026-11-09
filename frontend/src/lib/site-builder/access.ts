import { notFound } from "next/navigation";
import { getRealUser } from "@/lib/auth";
import type { User } from "@/lib/db/schema";

export const FORBIDDEN_MESSAGE =
  "Recurso disponível apenas para usuários autorizados.";

const SITE_BUILDER_ALLOWED_EMAIL = "brenohslima@gmail.com";

export function canAccessSiteBuilder(
  user: Pick<User, "email" | "isAdmin">
): boolean {
  return (
    user.isAdmin ||
    user.email.trim().toLowerCase() === SITE_BUILDER_ALLOWED_EMAIL
  );
}

/** Administradores e a conta autorizada não pagam hospedagem na VM do Atlas. */
export function hasComplimentaryAtlasHosting(
  user: Pick<User, "email" | "isAdmin">
): boolean {
  return canAccessSiteBuilder(user);
}

/**
 * Este é o único ponto que decide o acesso ao Criador de Sites.
 * Para abrir o recurso a todos, troque a regra aqui e o `builderOnly` em `navigation.ts`.
 * Usa o usuário REAL (como as demais telas de admin), então impersonar um cliente não muda o dono dos sites.
 */
export async function getBuilderUser(): Promise<User | null> {
  const user = await getRealUser();
  return canAccessSiteBuilder(user) ? user : null;
}

/** Para páginas: quem não é admin vê 404, como se a rota não existisse. */
export async function requireBuilderUser(): Promise<User> {
  const user = await getBuilderUser();
  if (!user) notFound();
  return user;
}
