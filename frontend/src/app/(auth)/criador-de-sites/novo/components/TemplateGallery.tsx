"use client";

import { Eye, Search } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";

export interface GalleryTemplate {
  description: string;
  id: string;
  name: string;
  pageCount: number;
  /** Miniatura já renderizada no servidor. */
  preview: ReactNode;
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
  const [featured, ...rest] = matches;

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

      {featured ? (
        <div className="grid overflow-hidden rounded-2xl border border-[#e5e2db] bg-white md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div
            className="h-[340px] overflow-hidden"
            style={{ background: featured.previewBackground }}
          >
            {featured.preview}
          </div>
          <div className="flex flex-col justify-center gap-3.5 p-7">
            <span className="self-start rounded-full bg-[#1d1c1a] px-[9px] py-1 font-medium text-[#d6f34a] text-[11px] tracking-[0.06em]">
              RECOMENDADO
            </span>
            <div className="font-medium text-2xl tracking-[-0.01em]">
              {featured.name}
            </div>
            <p className="text-[#55524c] text-sm leading-[1.55]">
              {featured.description}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                ...featured.tags,
                `${featured.pageCount} ${featured.pageCount === 1 ? "página" : "páginas"}`,
              ].map(t => (
                <span
                  className="rounded-full bg-[#f3f1ec] px-2.5 py-1 text-[#55524c] text-xs"
                  key={t}
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-2">
              <Link
                className="rounded-full bg-[#d6f34a] px-5 py-[11px] font-medium text-sm"
                href={`/criador-de-sites/novo/${featured.id}`}
              >
                Usar este template
              </Link>
              <Link
                className="flex items-center gap-1.5 rounded-full border border-[#e0ddd5] bg-white px-4 py-[11px] text-sm"
                href={`/criador-de-sites/preview/${featured.id}`}
              >
                <Eye className="size-[15px]" />
                Pré-visualizar
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-10 text-center text-[#6e6b65] text-sm">
          Nenhum template encontrado.
        </div>
      )}

      {rest.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-[18px]">
          {rest.map(t => (
            <Link
              className="flex flex-col overflow-hidden rounded-[14px] border border-[#e5e2db] bg-white hover:border-[#c9c5bc] hover:shadow-[0_4px_18px_rgba(30,28,24,0.06)]"
              href={`/criador-de-sites/novo/${t.id}`}
              key={t.id}
            >
              <div
                className="aspect-[4/3] overflow-hidden border-[#ece9e2] border-b"
                style={{ background: t.previewBackground }}
              >
                {t.thumb}
              </div>
              <div className="flex flex-col gap-1 px-4 py-3.5">
                <div className="font-medium text-sm">{t.name}</div>
                <div className="text-[#6e6b65] text-[13px] leading-[1.4]">
                  {t.description}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
