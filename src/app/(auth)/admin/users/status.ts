/**
 * ativo = cliente com algo contratado (VPS/VDS ou domínio);
 * inativo = tem conta mas não paga nada; suspenso = bloqueado por um admin.
 */
export type UserClientStatus = "active" | "inactive" | "suspended";

export function getUserClientStatus(u: {
  suspendedAt: Date | null;
  hasActiveSubscription: boolean;
  hasActiveDomain: boolean;
}): UserClientStatus {
  if (u.suspendedAt !== null) return "suspended";
  return u.hasActiveSubscription || u.hasActiveDomain ? "active" : "inactive";
}
