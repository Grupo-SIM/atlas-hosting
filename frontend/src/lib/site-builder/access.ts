import { notFound } from "next/navigation";
import { getRealUser, getUser } from "@/lib/auth";
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

/** Esta conta usa o Criador de Sites: autorizada pela lista, ou por permissão (templates, ou a área "Criador de Sites"). */
async function mayUseBuilder(user: User): Promise<boolean> {
  if (canAccessSiteBuilder(user)) return true;
  // Quem o admin master liberou para editar templates entra no Criador de Sites (galeria e editor do template), e
  // quem recebeu a área "Criador de Sites" usa o Criador com a própria conta.
  if (await hasAreaAccess(user, "admin_templates", "view")) return true;
  return await hasAreaAccess(user, "client_site_builder", "view");
}

/**
 * Quem usa o Criador de Sites neste pedido. Normalmente é o usuário da sessão; quando um admin está dentro da conta
 * de um cliente ("Acessar como cliente"), é o cliente: "Meus sites" mostra os sites dele (e não os do admin), e só abre
 * se a conta dele tem acesso, como no que ele mesmo veria. Devolve `null` quando a conta não pode usar o Criador.
 */
export async function pickBuilderUser(
  real: User,
  effective: User,
  allowed: (user: User) => Promise<boolean>
): Promise<User | null> {
  const acting = effective.id === real.id ? real : effective;
  return (await allowed(acting)) ? acting : null;
}

/**
 * Este é o único ponto que decide o acesso ao Criador de Sites.
 * Para abrir o recurso a todos, troque a regra aqui e o `builderOnly` em `navigation.ts`.
 * Dentro da conta de um cliente (impersonação), vale a conta do cliente, não a do admin.
 */
export async function getBuilderUser(): Promise<User | null> {
  const real = await getRealUser();
  // Só admin impersona; para os demais a sessão já é a conta que vale.
  const effective = real.isAdmin ? await getUser() : real;
  return pickBuilderUser(real, effective, mayUseBuilder);
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
