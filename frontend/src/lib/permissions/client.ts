import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/index";
import type { User } from "@/lib/db/schema";
import { loadTeamAccess, type TeamAccess } from "./access";
import { GRANTABLE_AREAS, isClientArea } from "./catalog";

/**
 * O que o painel do cliente mostra para esta conta. Cliente comum e admin completo veem tudo (`null` = sem
 * restrição). Quem tem acesso de equipe (a master deu acesso a uma conta, nova ou já existente) vê só as áreas do
 * painel do cliente que foram marcadas para ela: sem nada marcado, sobra só o essencial (Painel, perfil, suporte).
 *
 * Se a leitura do acesso falhar, a conta é tratada como cliente comum: um erro nunca deixa ninguém sem o próprio painel.
 */
export async function clientAreasFor(
  user: Pick<User, "id" | "isAdmin">
): Promise<ReadonlySet<string> | null> {
  if (user.isAdmin === true) return null;
  return clientAreasOf(await loadTeamAccess(user.id));
}

/** A conta de equipe (ou `null` se não é de equipe) → as áreas do painel do cliente liberadas, ou `null` = tudo. */
export function clientAreasOf(
  team: Pick<TeamAccess, "levels"> | null
): ReadonlySet<string> | null {
  if (!team) return null;
  return new Set(
    GRANTABLE_AREAS.filter(
      a => isClientArea(a.key) && (team.levels[a.key] ?? "none") !== "none"
    ).map(a => a.key)
  );
}

/** A conta pode usar esta área do painel do cliente? */
export async function clientAreaAllowed(
  user: Pick<User, "id" | "isAdmin"> | null | undefined,
  area: string
): Promise<boolean> {
  if (!user) return false;
  const areas = await clientAreasFor(user);
  return areas === null || areas.has(area);
}

/**
 * Para os layouts de cada seção do painel do cliente: conta com acesso de equipe sem a área vai para o Painel.
 * Vale para a conta que está sendo usada (na impersonação, a do cliente), então o admin vê o que ele veria.
 * É um limite de produto para a navegação e as páginas, não uma barreira contra pedidos feitos à mão.
 */
export async function requireClientArea(area: string): Promise<void> {
  const user = await getUser();
  if (!user) redirect("/login");
  if (!(await clientAreaAllowed(user, area))) redirect("/home");
}
