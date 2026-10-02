import { format, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";

function parseRegistrarDate(value: string | null | undefined): Date | null {
  if (!value?.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getRegistrarDates(
  createdValue: string | null | undefined,
  expiresValue: string | null | undefined,
  now = new Date()
) {
  const created = parseRegistrarDate(createdValue);
  const expires = parseRegistrarDate(expiresValue);

  return {
    expiryDate: expires
      ? format(expires, "dd/MM/yyyy", { locale: ptBR })
      : "Indisponível",
    registrationDate: created
      ? format(created, "dd/MM/yyyy", { locale: ptBR })
      : "Indisponível",
    status: expires
      ? isBefore(expires, now)
        ? ("expired" as const)
        : ("active" as const)
      : ("unknown" as const),
  };
}
