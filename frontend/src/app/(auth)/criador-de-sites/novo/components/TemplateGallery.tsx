"use client";

import { format } from "date-fns";
import { Crown, Eye, Lock, Search } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { formatBrl } from "@/lib/template-exclusivity/rules";
import {
  BuyExclusivityButton,
  ExclusivityBadge,
  ExclusivityRulesButton,
  type ExclusivityView,
  ProposalButton,
} from "../../exclusividades/components/ExclusivityControls";
import MasterTemplateControls from "./MasterTemplateControls";
import UseTemplateButton from "./UseTemplateButton";

export interface GalleryTemplate {
  description: string;
  /** Estado da exclusividade para quem está vendo (ausente = template livre). */
  exclusivity?: ExclusivityView;
  /** Admin master: o template já foi editado à mão (mostra o selo e "Descartar edições"); ausente = não é master. */
  master?: { draft: boolean; edited: boolean };
  id: string;
  name: string;
  pageCount: number;
  previewBackground: string;
  tags: string[];
  /** Miniatura menor para a grade. */
  thumb: ReactNode;
}

type ExclusivityFilter = "all" | "available" | "mine";

const chip = (active: boolean) =>
  `flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-[13px] ${
    active
      ? "border-[#1d1c1a] bg-[#1d1c1a] text-white"
      : "border-[#e0ddd5] bg-white text-[#1d1c1a]"
  }`;

/** Contorno do card conforme a exclusividade. */
function cardFrame(state?: ExclusivityView): string {
  if (state?.kind === "available") {
    return "border-[#1d1c1a] shadow-[0_6px_20px_rgba(30,28,24,0.10)]";
  }
  if (state?.kind === "owned_by_me") {
    return "border-[#b9d63a] shadow-[0_0_0_3px_rgba(214,243,74,0.35)]";
  }
  return "border-[#e5e2db] hover:border-[#c9c5bc] hover:shadow-[0_4px_18px_rgba(30,28,24,0.06)]";
}

const DEV_KEY = "sb-dev-mode";

export default function TemplateGallery({
  devAvailable = false,
  templates,
}: {
  /** Admin master e quem ele liberou: mostra a chave do modo Dev (editar os templates de demonstração). */
  devAvailable?: boolean;
  templates: GalleryTemplate[];
}) {
  // Modo Dev: lembra a escolha neste navegador. Começa desligado (como o cliente vê) e liga depois de ler a escolha.
  const [dev, setDev] = useState(false);
  useEffect(() => {
    if (!devAvailable) return;
    try {
      setDev(localStorage.getItem(DEV_KEY) === "1");
    } catch {
      // sem acesso ao armazenamento: segue desligado
    }
  }, [devAvailable]);
  const changeDev = (on: boolean) => {
    setDev(on);
    try {
      localStorage.setItem(DEV_KEY, on ? "1" : "0");
    } catch {
      // sem acesso ao armazenamento: vale só nesta visita
    }
  };
  const devOn = devAvailable && dev;
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("Todos");
  const [exclusivity, setExclusivity] = useState<ExclusivityFilter>("all");

  const tags = useMemo(
    () => ["Todos", ...new Set(templates.flatMap(t => t.tags))],
    [templates]
  );
  const availableCount = templates.filter(
    t => t.exclusivity?.kind === "available"
  ).length;
  const mineCount = templates.filter(
    t => t.exclusivity?.kind === "owned_by_me"
  ).length;

  const q = search.trim().toLowerCase();
  const matches = templates.filter(
    t =>
      (tag === "Todos" || t.tags.includes(tag)) &&
      (exclusivity === "all" ||
        (exclusivity === "available" && t.exclusivity?.kind === "available") ||
        (exclusivity === "mine" && t.exclusivity?.kind === "owned_by_me")) &&
      (!q ||
        `${t.name} ${t.description} ${t.tags.join(" ")}`
          .toLowerCase()
          .includes(q))
  );

  const toggleExclusivity = (value: ExclusivityFilter) =>
    setExclusivity(current => (current === value ? "all" : value));

  return (
    <div className="flex flex-col gap-6">
      {devAvailable ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-[#e5e2db] bg-white px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-[#1d1c1a] px-2 py-1 font-mono text-[#d6f34a] text-[13px]">
                {"</>"}
              </span>
              <div>
                <div className="font-medium text-sm">Modo Dev</div>
                <div className="text-[#6e6b65] text-xs">
                  Edite os templates de demonstração desta página.
                </div>
              </div>
            </div>
            <button
              aria-checked={devOn}
              aria-label="Modo Dev"
              className={`relative h-6 w-11 rounded-full transition-colors ${
                devOn ? "bg-[#1d1c1a]" : "bg-[#d9d6ce]"
              }`}
              onClick={() => changeDev(!devOn)}
              role="switch"
              type="button"
            >
              <span
                className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${
                  devOn ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>
          {devOn ? (
            <div
              className="rounded-[14px] border border-[#f1d3a6] bg-[#fdf1e0] px-4 py-3 text-[#92550c] text-sm leading-[1.5]"
              role="status"
            >
              <strong className="font-medium">{"</>"} Modo Dev ligado.</strong>{" "}
              Estes são <strong>templates de demonstração</strong>. Em{" "}
              <em>Editar template</em> o que você mexe fica em{" "}
              <strong>rascunho</strong> e só vira a versão que os clientes
              recebem quando você clica em <em>Publicar no template</em>, dentro
              do editor. Sites que já foram criados não mudam. Use{" "}
              <em>Descartar edições</em> para voltar ao original.
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="flex flex-col gap-1.5">
        <h1 className="font-medium text-[28px] tracking-[-0.02em]">
          Escolha um ponto de partida
        </h1>
        <p className="text-[#6e6b65] text-sm">
          Tudo pode ser alterado depois, direto no editor. Alguns templates
          podem ser só seus:{" "}
          <Link className="underline" href="/criador-de-sites/exclusividades">
            minhas exclusividades e propostas
          </Link>
          .
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
          {(availableCount > 0 || mineCount > 0) && (
            <span className="mx-1 my-2 w-px self-stretch bg-[#e0ddd5]" />
          )}
          {availableCount > 0 && (
            <button
              className={chip(exclusivity === "available")}
              onClick={() => toggleExclusivity("available")}
              type="button"
            >
              <Crown className="size-[13px]" />
              Com exclusividade
              <span className="text-[11px] opacity-60">{availableCount}</span>
            </button>
          )}
          {mineCount > 0 && (
            <button
              className={chip(exclusivity === "mine")}
              onClick={() => toggleExclusivity("mine")}
              type="button"
            >
              <Crown className="size-[13px]" />
              Meus exclusivos
              <span className="text-[11px] opacity-60">{mineCount}</span>
            </button>
          )}
        </div>
      </div>

      {matches.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[18px]">
          {matches.map(t => (
            <TemplateCard dev={devOn} key={t.id} template={t} />
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

function TemplateCard({
  dev,
  template: t,
}: {
  /** Modo Dev ligado: mostra "Editado" e os botões de editar o template. */
  dev: boolean;
  template: GalleryTemplate;
}) {
  const state = t.exclusivity;
  const locked = state?.kind === "owned_by_other" || state?.kind === "reserved";

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-[14px] border bg-white [contain-intrinsic-size:auto_470px] [content-visibility:auto] ${cardFrame(state)}`}
    >
      {/* O site da miniatura tem links: o link fica por cima, nunca em volta. */}
      <div
        className="relative aspect-[4/3] overflow-hidden border-[#ece9e2] border-b"
        style={{ background: t.previewBackground }}
      >
        <div
          className={
            locked ? "absolute inset-0 grayscale-[0.7]" : "absolute inset-0"
          }
        >
          {t.thumb}
        </div>
        {dev && (t.master?.edited || t.master?.draft) ? (
          <span className="absolute top-2.5 right-2.5 z-20 flex gap-1">
            {t.master?.edited ? (
              <span className="rounded-full bg-[#1d1c1a] px-2.5 py-1 text-[11px] text-white">
                Publicado
              </span>
            ) : null}
            {t.master?.draft ? (
              <span className="rounded-full bg-[#f59e0b] px-2.5 py-1 text-[#1d1c1a] text-[11px]">
                Rascunho
              </span>
            ) : null}
          </span>
        ) : null}
        {locked ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2.5 bg-[linear-gradient(180deg,rgba(29,28,26,0.25),rgba(29,28,26,0.72))] px-6 text-center text-white">
            <span className="flex size-10 items-center justify-center rounded-full border border-white/30 bg-white/15">
              <Lock className="size-[17px]" />
            </span>
            <span className="font-medium text-[13px]">
              {state?.kind === "reserved"
                ? "Reservado"
                : "Exclusivo de outro usuário"}
            </span>
            <span className="text-[12px] text-white/80 leading-[1.4]">
              {state?.kind === "reserved"
                ? "Outra pessoa está concluindo a compra da exclusividade."
                : "Faça uma proposta para comprar a exclusividade."}
            </span>
          </div>
        ) : (
          <>
            <ExclusivityBadge state={state} />
            <UseTemplateButton
              ariaLabel={`Usar o template ${t.name}`}
              className="absolute inset-0"
              templateId={t.id}
              templateName={t.name}
            />
          </>
        )}
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
          {!locked && (
            <UseTemplateButton
              className="rounded-full bg-[#d6f34a] px-4 py-2 font-medium text-[13px] disabled:opacity-60"
              templateId={t.id}
              templateName={t.name}
            >
              Usar este template
            </UseTemplateButton>
          )}
          {state?.kind === "owned_by_other" && (
            <ProposalButton
              className="flex items-center gap-1.5 rounded-full bg-[#1d1c1a] px-3.5 py-2 font-medium text-[13px] text-white"
              feePercent={state.feePercent}
              minOfferBrl={state.minOfferBrl}
              templateId={t.id}
              templateName={t.name}
            >
              Fazer proposta
            </ProposalButton>
          )}
          <Link
            className="flex items-center gap-1.5 rounded-full border border-[#e0ddd5] bg-white px-3 py-2 text-[13px]"
            href={`/criador-de-sites/preview/${t.id}`}
            prefetch={false}
          >
            <Eye className="size-[14px]" />
            Pré-visualizar
          </Link>
          {dev && t.master ? (
            <MasterTemplateControls
              edited={t.master.edited}
              templateId={t.id}
              templateName={t.name}
            />
          ) : null}
        </div>
      </div>

      <StatusStrip state={state} template={t} />
    </div>
  );
}

/** Faixa no rodapé do card com o resumo e a ação da exclusividade. */
function StatusStrip({
  state,
  template,
}: {
  state?: ExclusivityView;
  template: GalleryTemplate;
}) {
  const row = "flex items-center gap-2 border-t px-4 py-2.5 text-[12px]";
  const cta =
    "flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-[3px] font-medium underline underline-offset-2 disabled:opacity-60";

  if (state?.kind === "available") {
    return (
      <div className={`${row} border-[#1d1c1a] bg-[#1d1c1a] text-white`}>
        <Crown className="size-[13px] shrink-0" />
        <span className="min-w-0 flex-1 leading-[1.35]">
          Exclusividade por {formatBrl(state.annualPriceBrl)}/ano
        </span>
        <BuyExclusivityButton
          className={`${cta} bg-[#d6f34a] text-[#1d1c1a]`}
          templateId={template.id}
        >
          Garantir
        </BuyExclusivityButton>
      </div>
    );
  }

  if (state?.kind === "owned_by_me") {
    return (
      <div className={`${row} border-[#e3efb0] bg-[#f4f9dc] text-[#1d1c1a]`}>
        <Crown className="size-[13px] shrink-0" />
        <span className="min-w-0 flex-1 leading-[1.35]">
          Só você pode usar
          {state.expiresAt
            ? ` até ${format(new Date(state.expiresAt), "dd/MM/yyyy")}`
            : ""}
        </span>
        <Link className={cta} href="/criador-de-sites/exclusividades">
          Gerenciar
        </Link>
      </div>
    );
  }

  if (state?.kind === "owned_by_other") {
    return (
      <div className={`${row} border-[#ece9e2] bg-[#f6f5f1] text-[#1d1c1a]`}>
        <Lock className="size-[13px] shrink-0" />
        <span className="min-w-0 flex-1 leading-[1.35]">
          Propostas a partir de {formatBrl(state.minOfferBrl)}
        </span>
        <ExclusivityRulesButton
          className={cta}
          feePercent={state.feePercent}
          minOfferBrl={state.minOfferBrl}
        />
      </div>
    );
  }

  return null;
}
