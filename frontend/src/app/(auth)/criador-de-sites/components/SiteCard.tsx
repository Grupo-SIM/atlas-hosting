"use client";

import { ExternalLink, MoreHorizontal, Pencil } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteSite } from "../actions";
import { useSiteLive } from "./useSiteLive";

export type SiteStatus = "draft" | "failed" | "published" | "suspended";

const STATUS: Record<SiteStatus, { dot: string; label: string; pill: string }> =
  {
    draft: {
      dot: "bg-[color:var(--sbx-faint)]",
      label: "Não publicado",
      pill: "bg-[color:var(--sbx-fill-c)] text-[color:var(--sbx-mute)]",
    },
    failed: {
      dot: "bg-[#e11d48]",
      label: "Falha ao publicar",
      pill: "bg-[color:var(--sbx-err-bg2)] text-[color:var(--sbx-err-fg2)]",
    },
    published: {
      dot: "bg-[#22a06b]",
      label: "No ar",
      pill: "bg-[color:var(--sbx-ok-bg)] text-[color:var(--sbx-ok-fg)]",
    },
    suspended: {
      dot: "bg-[#d97706]",
      label: "Suspenso",
      pill: "bg-[color:var(--sbx-warn-bg)] text-[color:var(--sbx-warn-fg)]",
    },
  };

/** Publicado, mas o endereço ainda não abre. */
const WAITING: Record<
  "checking" | "no_dns" | "no_site",
  { dot: string; label: string; pill: string }
> = {
  checking: {
    dot: "bg-[color:var(--sbx-faint)] animate-pulse",
    label: "Verificando…",
    pill: "bg-[color:var(--sbx-fill-c)] text-[color:var(--sbx-mute)]",
  },
  no_dns: {
    dot: "bg-[#d97706] animate-pulse",
    label: "Aguardando DNS",
    pill: "bg-[color:var(--sbx-warn-bg)] text-[color:var(--sbx-warn-fg)]",
  },
  no_site: {
    dot: "bg-[#d97706] animate-pulse",
    label: "Ativando HTTPS",
    pill: "bg-[color:var(--sbx-warn-bg)] text-[color:var(--sbx-warn-fg)]",
  },
};

interface Props {
  background: string;
  domain: string | null;
  /** Aviso de exclusividade do template (prazo para sair do ar ou bloqueio). */
  exclusivityNotice?: string | null;
  id: string;
  name: string;
  status: SiteStatus;
  /** Miniatura já renderizada no servidor. */
  thumb: ReactNode;
}

export default function SiteCard({
  background,
  domain,
  exclusivityNotice,
  id,
  name,
  status,
  thumb,
}: Props) {
  const [pending, startTransition] = useTransition();
  const live = useSiteLive(id, status === "published" && !!domain);
  // "Publicado" só vira "No ar" quando o endereço realmente abre.
  const state =
    status === "published" && live && live !== "live"
      ? WAITING[live]
      : STATUS[status];

  const [confirming, setConfirming] = useState(false);

  const remove = () => {
    startTransition(async () => {
      const data = new FormData();
      data.append("siteId", id);
      try {
        const result = await deleteSite(data);
        if (result.ok) toast.success("Site excluído");
        else toast.error(result.error);
      } catch {
        toast.error("Não foi possível excluir o site.");
      }
    });
  };

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-[14px] border border-[color:var(--sbx-line-b)] bg-[color:var(--sbx-card)] [contain-intrinsic-size:auto_420px] [content-visibility:auto] ${pending ? "opacity-60" : ""}`}
    >
      {/* O site da miniatura tem links: o link do cartão fica por cima, nunca em volta (`<a>` dentro de `<a>` quebra o HTML). */}
      <div
        className="relative h-[190px] overflow-hidden border-[color:var(--sbx-line-soft)] border-b"
        style={{ background }}
      >
        {thumb}
        <Link
          aria-label={`Editar ${name}`}
          className="absolute inset-0"
          href={`/criador-de-sites/${id}`}
          prefetch={false}
        />
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-[3px]">
            <div className="truncate font-medium text-[15px]">{name}</div>
            <div className="truncate text-[13px] text-[color:var(--sbx-mute)]">
              {domain ?? "Sem endereço"}
            </div>
          </div>
          <span
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs ${state.pill}`}
          >
            <span className={`size-1.5 rounded-full ${state.dot}`} />
            {state.label}
          </span>
        </div>
        {exclusivityNotice ? (
          <p className="rounded-lg bg-[color:var(--sbx-warn-bg)] px-3 py-2 text-[12px] text-[color:var(--sbx-warn-fg)] leading-[1.4]">
            {exclusivityNotice}
          </p>
        ) : null}
        <div className="flex gap-2">
          <Link
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[color:var(--sbx-ink)] px-3 py-[9px] text-[13px] text-[color:var(--sbx-on-ink)]"
            href={`/criador-de-sites/${id}`}
            prefetch={false}
          >
            <Pencil className="size-3.5" />
            Editar site
          </Link>
          {status === "published" && domain ? (
            <a
              className="flex items-center gap-1.5 rounded-full border border-[color:var(--sbx-line)] bg-[color:var(--sbx-card)] px-3 py-[9px] text-[13px]"
              href={`https://${domain}`}
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink className="size-3.5" />
              Ver
            </a>
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Mais opções"
              className="flex w-9 items-center justify-center rounded-full border border-[color:var(--sbx-line)] bg-[color:var(--sbx-card)]"
            >
              <MoreHorizontal className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/criador-de-sites/${id}/publicar`}>
                  Configurar publicação
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onSelect={() => setConfirming(true)}
              >
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <AlertDialog onOpenChange={setConfirming} open={confirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir o site "{name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Não dá para desfazer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
