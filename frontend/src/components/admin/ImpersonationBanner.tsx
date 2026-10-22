import { stopImpersonationAction } from "@/app/(auth)/admin/users/impersonation-actions";
import { getImpersonationState } from "@/lib/auth/impersonation";

/**
 * Barra fixa exibida enquanto um admin acessa a conta de um cliente.
 * Deixa o estado explícito (nada de acesso escondido) e oferece saída rápida.
 */
export default async function ImpersonationBanner() {
  const state = await getImpersonationState();
  if (!state) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 bg-amber-500 px-4 py-2 font-medium text-amber-950 text-sm">
      <span>
        Você está acessando como{" "}
        <strong>{state.target.name || state.target.email}</strong> (
        {state.target.email}) — admin: {state.admin.email}
      </span>
      <form action={stopImpersonationAction}>
        <button
          className="rounded-md bg-amber-950 px-3 py-1 font-semibold text-amber-50 text-xs transition-colors hover:bg-amber-900"
          type="submit"
        >
          Sair da conta do cliente
        </button>
      </form>
    </div>
  );
}
