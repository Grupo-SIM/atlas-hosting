import { redirect } from "next/navigation";
import { getRealUser, getUser } from "@/lib/auth/index";
import type { User } from "@/lib/db/schema";

/**
 * Páginas de administração: quem não é admin vai para /home. Usa o usuário efetivo (como as demais telas de admin),
 * então impersonar um cliente tira o acesso de admin enquanto durar.
 */
export async function requireAdminPage(): Promise<User> {
  const user = await getUser();
  if (!user?.isAdmin) redirect("/home");
  return user;
}

/**
 * Server actions de administração: Server Actions são POSTs públicos, então a checagem tem que estar na própria
 * ação (a do render da página não protege uma chamada direta). Usa o usuário real, ignorando impersonação.
 */
export async function isAdminRequest(): Promise<boolean> {
  const user = await getRealUser();
  return user.isAdmin === true;
}
