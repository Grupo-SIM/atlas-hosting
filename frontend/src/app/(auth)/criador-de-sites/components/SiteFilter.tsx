import Link from "next/link";

export type SiteFilterValue = "nao-publicado" | "no-ar" | "todos";

const FILTERS: { label: string; value: SiteFilterValue }[] = [
  { label: "Todos", value: "todos" },
  { label: "No ar", value: "no-ar" },
  { label: "Não publicados", value: "nao-publicado" },
];

/** Valor da URL (`?status=`) → filtro; qualquer coisa fora da lista vira "todos". */
export function parseSiteFilter(value: string | undefined): SiteFilterValue {
  return FILTERS.find(f => f.value === value)?.value ?? "todos";
}

/**
 * Filtro de "Meus sites": ver todos, só os que estão no ar ou só os ainda não publicados (em desenvolvimento).
 * O estado fica na URL (`?status=`), então recarregar ou compartilhar o endereço mantém o filtro.
 */
export default function SiteFilter({
  active,
  counts,
}: {
  active: SiteFilterValue;
  counts: Record<SiteFilterValue, number>;
}) {
  return (
    <nav aria-label="Filtrar sites" className="flex flex-wrap gap-1.5">
      {FILTERS.map(f => {
        const on = f.value === active;
        return (
          <Link
            aria-current={on ? "page" : undefined}
            className={`flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13px] ${
              on
                ? "border-[color:var(--sbx-ink)] bg-[color:var(--sbx-ink)] text-[color:var(--sbx-on-ink)]"
                : "border-[color:var(--sbx-line)] bg-[color:var(--sbx-card)] text-[color:var(--sbx-ink)] hover:border-[color:var(--sbx-line-x)]"
            }`}
            href={
              f.value === "todos"
                ? "/criador-de-sites"
                : `/criador-de-sites?status=${f.value}`
            }
            key={f.value}
            prefetch={false}
            replace
            scroll={false}
          >
            {f.label}
            <span
              className={on ? "text-white/70" : "text-[color:var(--sbx-faint)]"}
            >
              {counts[f.value]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
