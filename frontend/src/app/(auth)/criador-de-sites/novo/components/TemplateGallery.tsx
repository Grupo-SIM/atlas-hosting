"use client";

import { Eye, Search } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";

export interface GalleryTemplate {
  description: string;
  id: string;
  name: string;
  pageCount: number;
  previewBackground: string;
  tags: string[];
  /** Miniatura menor para a grade. */
  thumb: ReactNode;
}

const chip = (active: boolean) =>
  `h-10 rounded-full border px-3.5 text-[13px] ${
    active
      ? "border-[#1d1c1a] bg-[#1d1c1a] text-white"
      : "border-[#e0ddd5] bg-white text-[#1d1c1a]"
  }`;

export default function TemplateGallery({
  templates,
}: {
  templates: GalleryTemplate[];
}) {
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("Todos");

  const tags = useMemo(
    () => ["Todos", ...new Set(templates.flatMap(t => t.tags))],
    [templates]
  );

  const q = search.trim().toLowerCase();
  const matches = templates.filter(
    t =>
      (tag === "Todos" || t.tags.includes(tag)) &&
      (!q ||
        `${t.name} ${t.description} ${t.tags.join(" ")}`
          .toLowerCase()
          .includes(q))
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-medium text-[28px] tracking-[-0.02em]">
          Escolha um ponto de partida
        </h1>
        <p className="text-[#6e6b65] text-sm">
          Tudo pode ser alterado depois, direto no editor.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <label className="flex h-10 min-w-60 flex-1 items-center gap-2 rounded-full border border-[#e0ddd5] bg-white px-3.5">
          <Search className="size-[15px] text-[#9a968e]" />
          <input
            className="flex-1 border-0 bg-transparent text-sm outline-none"
            onChange={e => setSearch(e.target.value)}
            placeholder="Pesquise por um template..."
            value={search}
          />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {tags.map(t => (
            <button
              className={chip(tag === t)}
              key={t}
              onClick={() => setTag(t)}
              type="button"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {matches.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[18px]">
          {matches.map(t => (
            <div
              className="flex flex-col overflow-hidden rounded-[14px] border border-[#e5e2db] bg-white hover:border-[#c9c5bc] hover:shadow-[0_4px_18px_rgba(30,28,24,0.06)]"
              key={t.id}
            >
              {/* O site da miniatura tem links: o link fica por cima, nunca em volta. */}
              <div
                className="relative aspect-[4/3] overflow-hidden border-[#ece9e2] border-b"
                style={{ background: t.previewBackground }}
              >
                {t.thumb}
                <Link
                  aria-label={`Usar o template ${t.name}`}
                  className="absolute inset-0"
                  href={`/criador-de-sites/novo/${t.id}`}
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 px-4 py-3.5">
                <div className="font-medium text-sm">{t.name}</div>
                <div className="text-[#6e6b65] text-[13px] leading-[1.4]">
                  {t.description}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    ...t.tags,
                    `${t.pageCount} ${t.pageCount === 1 ? "página" : "páginas"}`,
                  ].map(tagName => (
                    <span
                      className="rounded-full bg-[#f3f1ec] px-2 py-0.5 text-[#55524c] text-[11px]"
                      key={tagName}
                    >
                      {tagName}
                    </span>
                  ))}
                </div>
                <div className="mt-auto flex flex-wrap gap-2 pt-1.5">
                  <Link
                    className="rounded-full bg-[#d6f34a] px-4 py-2 font-medium text-[13px]"
                    href={`/criador-de-sites/novo/${t.id}`}
                  >
                    Usar este template
                  </Link>
                  <Link
                    className="flex items-center gap-1.5 rounded-full border border-[#e0ddd5] bg-white px-3 py-2 text-[13px]"
                    href={`/criador-de-sites/preview/${t.id}`}
                  >
                    <Eye className="size-[14px]" />
                    Pré-visualizar
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-10 text-center text-[#6e6b65] text-sm">
          Nenhum template encontrado.
        </div>
      )}
    </div>
  );
}
