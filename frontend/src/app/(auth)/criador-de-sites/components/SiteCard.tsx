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
      dot: "bg-[#9a968e]",
      label: "Não publicado",
      pill: "bg-[#efece6] text-[#6e6b65]",
    },
    failed: {
      dot: "bg-[#e11d48]",
      label: "Falha ao publicar",
      pill: "bg-[#fbe7e8] text-[#a3292f]",
    },
    published: {
      dot: "bg-[#22a06b]",
      label: "No ar",
      pill: "bg-[#e6f5ec] text-[#1f7a4d]",
    },
    suspended: {
      dot: "bg-[#d97706]",
      label: "Suspenso",
      pill: "bg-[#fdf1e0] text-[#92550c]",
    },
  };

/** Publicado, mas o endereço ainda não abre. */
const WAITING: Record<
  "checking" | "no_dns" | "no_site",
  { dot: string; label: string; pill: string }
> = {
  checking: {
    dot: "bg-[#9a968e] animate-pulse",
    label: "Verificando…",
    pill: "bg-[#efece6] text-[#6e6b65]",
  },
  no_dns: {
    dot: "bg-[#d97706] animate-pulse",
    label: "Aguardando DNS",
    pill: "bg-[#fdf1e0] text-[#92550c]",
  },
  no_site: {
    dot: "bg-[#d97706] animate-pulse",
    label: "Ativando HTTPS",
    pill: "bg-[#fdf1e0] text-[#92550c]",
  },
};

interface Props {
  background: string;
  domain: string | null;
  id: string;
  name: string;
  status: SiteStatus;
  /** Miniatura já renderizada no servidor. */
  thumb: ReactNode;
}

export default function SiteCard({
  background,
  domain,
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
      className={`flex flex-col overflow-hidden rounded-[14px] border border-[#e5e2db] bg-white ${pending ? "opacity-60" : ""}`}
    >
      {/* O site da miniatura tem links: o link do cartão fica por cima, nunca em volta (`<a>` dentro de `<a>` quebra o HTML). */}
      <div
        className="relative h-[190px] overflow-hidden border-[#ece9e2] border-b"
        style={{ background }}
      >
        {thumb}
        <Link
          aria-label={`Editar ${name}`}
          className="absolute inset-0"
          href={`/criador-de-sites/${id}`}
        />
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-[3px]">
            <div className="truncate font-medium text-[15px]">{name}</div>
            <div className="truncate text-[#6e6b65] text-[13px]">
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
        <div className="flex gap-2">
          <Link
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#1d1c1a] px-3 py-[9px] text-[13px] text-white"
            href={`/criador-de-sites/${id}`}
          >
            <Pencil className="size-3.5" />
            Editar site
          </Link>
          {status === "published" && domain ? (
            <a
              className="flex items-center gap-1.5 rounded-full border border-[#e0ddd5] bg-white px-3 py-[9px] text-[13px]"
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
              className="flex w-9 items-center justify-center rounded-full border border-[#e0ddd5] bg-white"
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
