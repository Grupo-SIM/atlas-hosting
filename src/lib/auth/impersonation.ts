import { cookies } from "next/headers";
import { getRealUser, loadFullUserById } from ".";

/**
 * Nome do cookie que marca uma sessão de impersonação ("Acessar como cliente").
 * Guarda apenas o id do cliente-alvo. Sozinho não concede acesso: `getUser`
 * só o respeita se o principal autenticado REAL for admin.
 */
export const IMPERSONATE_COOKIE = "atlas_impersonate";

export type ImpersonationState = {
  admin: { id: string; email: string; name: string };
  target: { id: string; email: string; name: string };
};

/**
 * Retorna o estado de impersonação atual, ou null se não houver.
 * Barato para usuários normais: sai imediatamente se o cookie não existe.
 */
export async function getImpersonationState(): Promise<ImpersonationState | null> {
  const cookieStore = await cookies();
  const targetId = cookieStore.get(IMPERSONATE_COOKIE)?.value;
  if (!targetId) return null;

  const admin = await getRealUser();
  if (!admin.isAdmin || admin.id === targetId) return null;

  const target = await loadFullUserById(targetId);
  if (!target) return null;

  return {
    admin: { id: admin.id, email: admin.email, name: admin.name },
    target: { id: target.id, email: target.email, name: target.name },
  };
}
