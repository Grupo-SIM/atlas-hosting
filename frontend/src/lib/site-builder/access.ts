import { notFound } from "next/navigation";
import { getRealUser } from "@/lib/auth";
import type { User } from "@/lib/db/schema";

export const FORBIDDEN_MESSAGE =
  "Recurso disponível apenas para usuários autorizados.";

const SITE_BUILDER_ALLOWED_EMAIL = "brenohslima@gmail.com";

import { hasAreaAccess } from "@/lib/permissions/access";
import { isMasterAdmin } from "@/lib/permissions/master";

export { isMasterAdmin };

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
  if (canAccessSiteBuilder(user)) return user;
  // Quem o admin master liberou para editar templates entra no Criador de Sites (galeria e editor do template), e
  // quem recebeu a área "Criador de Sites" usa o Criador com a própria conta.
  if (await hasAreaAccess(user, "admin_templates", "view")) return user;
  return (await hasAreaAccess(user, "client_site_builder", "view"))
    ? user
    : null;
}

/** Para páginas: quem não é admin vê 404, como se a rota não existisse. */
export async function requireBuilderUser(): Promise<User> {
  const user = await getBuilderUser();
  if (!user) notFound();
  return user;
}

/**
 * Quem pode editar os templates de demonstração (modo Dev): o admin master e quem ele liberou (permissão "Editar
 * templates"). Usuário real, ignora impersonação; `null` para os demais.
 */
export async function getTemplateEditor(): Promise<User | null> {
  const user = await getRealUser();
  return (await hasAreaAccess(user, "admin_templates", "edit")) ? user : null;
}

/** Para a página do editor de templates: quem não pode editar vê 404. */
export async function requireTemplateEditor(): Promise<User> {
  const user = await getTemplateEditor();
  if (!user) notFound();
  return user;
}

/**
 * Cópias dos templates para sites importados do WordPress (ids `wp-…`): só o admin master e quem ele liberou (a mesma
 * permissão "Editar templates", em qualquer nível). Os demais admins e clientes não as veem nem as usam.
 */
export async function canUseWordpressTemplates(user: User): Promise<boolean> {
  return await hasAreaAccess(user, "admin_templates", "view");
}
