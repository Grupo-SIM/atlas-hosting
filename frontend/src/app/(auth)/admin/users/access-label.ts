import {
  isMasterOnlyArea,
  OUTSIDE_ALL_AREAS,
  PROFILE_LABELS,
} from "@/lib/permissions/catalog";
import type { TeamUserRow } from "./team-actions";

/** Resumo do que a pessoa acessa (para a lista da equipe e para a tabela de usuários). */
export function summary(row: TeamUserRow, master: boolean): string {
  // O que só o master concede (editar templates) só aparece para ele: para os demais a escolha já foi feita.
  const hasTemplates =
    master && row.permissions.some(p => p.area === "admin_templates");
  const templates = hasTemplates
    ? ` + Editar templates (${
        row.validation === "owner"
          ? "validação com o cliente"
          : row.validation === "master"
            ? "validação com o Lucas"
            : "validação automática"
      })`
    : "";
  if (row.profile === "admin") {
    return `Todas as áreas, inclusive Usuários${templates}`;
  }
  const n = row.permissions.filter(
    p => master || !isMasterOnlyArea(p.area)
  ).length;
  if (row.accessAll) {
    const extra = row.permissions.some(p => p.area === OUTSIDE_ALL_AREAS)
      ? " + Usuários"
      : "";
    return `Todas as áreas (${row.accessAll === "edit" ? "edita" : "visualiza"})${extra}${templates}`;
  }
  return `${n} ${n === 1 ? "área" : "áreas"}`;
}

export interface AccessUser {
  email: string;
  id: string;
  isAdmin: boolean;
  name: string;
}

/** O que mostrar de acesso para um usuário da tabela. */
export function accessLabel(
  user: AccessUser,
  row: TeamUserRow | undefined,
  master: boolean
): { badge?: string; text: string } {
  if (row) {
    return { badge: PROFILE_LABELS[row.profile], text: summary(row, master) };
  }
  if (user.isAdmin) return { badge: "Administrador", text: "Todas as áreas" };
  return { text: "Cliente (sem acesso de equipe)" };
}
