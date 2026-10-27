import type { User } from "@/lib/db/schema";

/** Resolve a conta acessada sem conceder impersonação pelo cookie sozinho. */
export async function resolveEffectiveUser(
  principal: User,
  targetId: string | undefined,
  loadUser: (id: string) => Promise<User | null>
): Promise<User> {
  if (!targetId || !principal.isAdmin || targetId === principal.id) {
    return principal;
  }

  const target = await loadUser(targetId);
  if (!target?.organization) return principal;

  return { ...target, impersonatedBy: principal.id };
}
