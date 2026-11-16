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
                ? "border-[#1d1c1a] bg-[#1d1c1a] text-white"
                : "border-[#e0ddd5] bg-white text-[#1d1c1a] hover:border-[#c9c5bc]"
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
            <span className={on ? "text-white/70" : "text-[#9a968e]"}>
              {counts[f.value]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
