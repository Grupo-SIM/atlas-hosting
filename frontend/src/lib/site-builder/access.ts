import { notFound } from "next/navigation";
import { getRealUser } from "@/lib/auth";
import type { User } from "@/lib/db/schema";

export const FORBIDDEN_MESSAGE =
  "Recurso disponível apenas para usuários autorizados.";

const SITE_BUILDER_ALLOWED_EMAIL = "brenohslima@gmail.com";

/** Admin master do Criador de Sites: pode editar os templates à mão (a versão editada vale para sites novos). */
const MASTER_ADMIN_EMAIL = "contatosimintermediacoes@gmail.com";

/** Precisa ser admin **e** ter este e-mail: perder um dos dois tira o poder de editar templates. */
export function isMasterAdmin(user: Pick<User, "email" | "isAdmin">): boolean {
  return (
    user.isAdmin === true &&
    user.email.trim().toLowerCase() === MASTER_ADMIN_EMAIL
  );
}

export function canAccessSiteBuilder(
  user: Pick<User, "email" | "isAdmin">
): boolean {
  return (
    user.isAdmin ||
    user.email.trim().toLowerCase() === SITE_BUILDER_ALLOWED_EMAIL
  );
}

/**
 * Hospedagem na VM do Atlas é gratuita só com `SITE_BUILDER_HOSTING_FREE=true`
 * (variável de ambiente, configurável no Komodo). Vale para todos, inclusive
 * admins e a conta autorizada — liga/desliga sem precisar de deploy.
 */
export function hasComplimentaryAtlasHosting(): boolean {
  return process.env.SITE_BUILDER_HOSTING_FREE?.trim().toLowerCase() === "true";
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

/** Usuário real se for o admin master; `null` para os demais. */
export async function getMasterAdmin(): Promise<User | null> {
  const user = await getRealUser();
  return isMasterAdmin(user) ? user : null;
}

/** Para páginas do editor de templates: quem não é o master vê 404. */
export async function requireMasterAdmin(): Promise<User> {
  const user = await getMasterAdmin();
  if (!user) notFound();
  return user;
}
