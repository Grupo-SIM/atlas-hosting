"use client";

import { Check, ChevronDown, X } from "lucide-react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  relatedTags,
  type TagCount,
  type Tagged,
  tagCounts,
} from "./template-filter";

const row = (active: boolean) =>
  `flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-[13px] ${
    active
      ? "bg-[color:var(--sbx-ink)] text-[color:var(--sbx-on-ink)]"
      : "text-[color:var(--sbx-ink)] hover:bg-[color:var(--sbx-fill)]"
  }`;

/**
 * Filtro por categoria em dois passos, num só botão: escolhe a categoria (Blog, Viagens, Notícias…) e,
 * ao lado, o que existe dentro dela (blog de tecnologia, de viagens…).
 */
export default function TemplateFilter({
  onChange,
  sub,
  tag,
  templates,
}: {
  onChange: (tag: string | null, sub: string | null) => void;
  sub: string | null;
  tag: string | null;
  templates: Tagged[];
}) {
  const [open, setOpen] = useState(false);
  const all = tagCounts(templates);
  const inside: TagCount[] = tag ? relatedTags(templates, tag) : [];
  const total = templates.length;
  const tagTotal = all.find(c => c.tag === tag)?.count ?? 0;
  const label = tag ? (sub ? `${tag} › ${sub}` : tag) : "Todas as categorias";

  const pick = (next: string | null) => {
    if (!next) {
      onChange(null, null);
      setOpen(false);
      return;
    }
    onChange(next, null);
    // Sem nada dentro da categoria, não há segundo passo: fecha.
    if (relatedTags(templates, next).length === 0) setOpen(false);
  };

  return (
    <div className="flex items-center gap-1.5">
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <button
            aria-expanded={open}
            className={`flex h-10 items-center gap-2 rounded-full border px-3.5 text-[13px] ${
              tag
                ? "border-[color:var(--sbx-ink)] bg-[color:var(--sbx-ink)] text-[color:var(--sbx-on-ink)]"
                : "border-[color:var(--sbx-line)] bg-[color:var(--sbx-card)] text-[color:var(--sbx-ink)]"
            }`}
            type="button"
          >
            {label}
            <ChevronDown className="size-[14px] opacity-70" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[min(560px,calc(100vw-2rem))] border-[color:var(--sbx-line)] bg-[color:var(--sbx-card)] p-2 text-[color:var(--sbx-ink)]"
        >
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <div className="px-3 pt-1 pb-1.5 font-medium text-[11px] text-[color:var(--sbx-mute)] uppercase tracking-wide">
                Categoria
              </div>
              <div className="flex max-h-72 flex-col gap-0.5 overflow-auto">
                <button
                  className={row(!tag)}
                  onClick={() => pick(null)}
                  type="button"
                >
                  <span>Todas as categorias</span>
                  <span className="text-[11px] opacity-60">{total}</span>
                </button>
                {all.map(c => (
                  <button
                    className={row(tag === c.tag)}
                    key={c.tag}
                    onClick={() => pick(c.tag)}
                    type="button"
                  >
                    <span>{c.tag}</span>
                    <span className="text-[11px] opacity-60">{c.count}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:border-[color:var(--sbx-line)] sm:border-l sm:pl-2">
              <div className="px-3 pt-1 pb-1.5 font-medium text-[11px] text-[color:var(--sbx-mute)] uppercase tracking-wide">
                {tag ? `Dentro de ${tag}` : "Tipo"}
              </div>
              {tag ? (
                <div className="flex max-h-72 flex-col gap-0.5 overflow-auto">
                  <button
                    className={row(!sub)}
                    onClick={() => {
                      onChange(tag, null);
                      setOpen(false);
                    }}
                    type="button"
                  >
                    <span>Todos de {tag}</span>
                    <span className="text-[11px] opacity-60">{tagTotal}</span>
                  </button>
                  {inside.map(c => (
                    <button
                      className={row(sub === c.tag)}
                      key={c.tag}
                      onClick={() => {
                        onChange(tag, c.tag);
                        setOpen(false);
                      }}
                      type="button"
                    >
                      <span className="flex items-center gap-1.5">
                        {sub === c.tag ? <Check className="size-3" /> : null}
                        {c.tag}
                      </span>
                      <span className="text-[11px] opacity-60">{c.count}</span>
                    </button>
                  ))}
                  {inside.length === 0 ? (
                    <p className="px-3 py-2 text-[12px] text-[color:var(--sbx-mute)]">
                      Não há outros tipos dentro de {tag}.
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="px-3 py-2 text-[12px] text-[color:var(--sbx-mute)]">
                  Escolha uma categoria para ver o que há dentro dela.
                </p>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {tag ? (
        <button
          aria-label="Limpar o filtro de categoria"
          className="flex size-10 items-center justify-center rounded-full border border-[color:var(--sbx-line)] bg-[color:var(--sbx-card)] text-[color:var(--sbx-mute)] hover:text-[color:var(--sbx-ink)]"
          onClick={() => onChange(null, null)}
          title="Limpar"
          type="button"
        >
          <X className="size-[14px]" />
        </button>
      ) : null}
    </div>
  );
}
