"use client";

import { ArrowLeft, ExternalLink, Loader, Search, Users } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  DelegatedAdmin,
  ValidationMode,
} from "@/lib/site-builder/delegation";
import {
  type ClientRow,
  type ClientSiteRow,
  type ClientSiteStatus,
  getAdminValidation,
  listClientSites,
  searchClients,
  setAdminValidation,
} from "../client-actions";

const STATUS: Record<ClientSiteStatus, { label: string; pill: string }> = {
  draft: {
    label: "Não publicado",
    pill: "bg-[color:var(--sbx-fill)] text-[color:var(--sbx-mute)]",
  },
  editing: {
    label: "Em edição",
    pill: "bg-[color:var(--sbx-warn-bg)] text-[color:var(--sbx-warn-fg)]",
  },
  failed: {
    label: "Falhou ao publicar",
    pill: "bg-[color:var(--sbx-err-bg)] text-[color:var(--sbx-err-fg)]",
  },
  live: {
    label: "No ar",
    pill: "bg-[color:var(--sbx-ok-bg)] text-[color:var(--sbx-ok-fg)]",
  },
};

const row =
  "flex w-full items-center justify-between gap-3 rounded-[10px] border border-[color:var(--sbx-line)] bg-[color:var(--sbx-card)] px-3.5 py-2.5 text-left text-sm";

/**
 * Sites de todos os clientes, para o admin master e para quem ele liberou: pesquisa o cliente por nome ou e-mail e
 * lista os sites dele (no ar, em edição, não publicados). Quem só visualiza não vê o botão "Abrir".
 */
export default function ClientSitesModal({
  canEdit,
}: {
  /** Pode abrir e editar os sites dos clientes (permissão em nível de edição). */
  canEdit: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [client, setClient] = useState<ClientRow | null>(null);
  const [sites, setSites] = useState<ClientSiteRow[]>([]);
  // Só o admin master recebe esta lista (como cada admin dele é validado).
  const [admins, setAdmins] = useState<DelegatedAdmin[] | null>(null);
  const latest = useRef(0);

  const search = useCallback(async (term: string) => {
    const ticket = ++latest.current;
    setLoading(true);
    setError("");
    const result = await searchClients(term);
    if (ticket !== latest.current) return;
    setLoading(false);
    if (result.ok) setClients(result.rows);
    else setError(result.error);
  }, []);

  // Pesquisa com um pequeno atraso para não consultar a cada tecla.
  useEffect(() => {
    if (!open || client) return;
    const timer = setTimeout(() => void search(query), query ? 250 : 0);
    return () => clearTimeout(timer);
  }, [open, client, query, search]);

  useEffect(() => {
    if (!open) return;
    void getAdminValidation().then(result => {
      if (result.ok) setAdmins(result.admins);
    });
  }, [open]);

  const pick = async (next: ClientRow) => {
    setClient(next);
    setSites([]);
    setLoading(true);
    setError("");
    const result = await listClientSites(next.id);
    setLoading(false);
    if (result.ok) setSites(result.rows);
    else setError(result.error);
  };

  const changeMode = async (adminId: string, mode: ValidationMode) => {
    const previous = admins;
    setAdmins(list =>
      list ? list.map(a => (a.id === adminId ? { ...a, mode } : a)) : list
    );
    const result = await setAdminValidation(adminId, mode);
    if (!result.ok) {
      setAdmins(previous);
      setError(result.error);
    }
  };

  return (
    <>
      <button
        className="flex items-center gap-1.5 rounded-full border border-[color:var(--sbx-line)] bg-[color:var(--sbx-card)] px-[18px] py-2.5 text-[color:var(--sbx-ink)] text-sm"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Users className="size-[15px]" />
        Sites de clientes
      </button>
      <Dialog
        onOpenChange={next => {
          setOpen(next);
          if (!next) {
            setClient(null);
            setQuery("");
          }
        }}
        open={open}
      >
        <DialogContent className="w-[calc(100vw-32px)] max-w-[560px] gap-4 rounded-2xl bg-[color:var(--sbx-bg)] p-6 text-[color:var(--sbx-ink)] [&>*]:min-w-0">
          <DialogHeader className="gap-1 text-left">
            <DialogTitle className="font-medium text-xl tracking-[-0.02em]">
              {client ? client.name : "Sites de clientes"}
            </DialogTitle>
            <DialogDescription>
              {client
                ? client.email
                : "Pesquise um cliente por nome ou e-mail para ver todos os sites dele."}
            </DialogDescription>
          </DialogHeader>

          {client ? (
            <>
              <button
                className="flex w-fit items-center gap-1.5 text-[13px] text-[color:var(--sbx-mute)]"
                onClick={() => setClient(null)}
                type="button"
              >
                <ArrowLeft className="size-[14px]" />
                Voltar à pesquisa
              </button>
              <div className="flex max-h-[52vh] flex-col gap-2 overflow-auto">
                {loading ? (
                  <Loader className="mx-auto my-6 size-5 animate-spin" />
                ) : sites.length === 0 ? (
                  <p className="p-6 text-center text-[color:var(--sbx-mute)] text-sm">
                    Este cliente ainda não criou nenhum site.
                  </p>
                ) : (
                  sites.map(site => {
                    const status = STATUS[site.status];
                    return (
                      <div className={row} key={site.id}>
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <span className="truncate font-medium">
                            {site.name}
                          </span>
                          <span className="truncate text-[color:var(--sbx-mute)] text-xs">
                            {site.template}
                            {site.domain ? ` · ${site.domain}` : ""}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] ${status.pill}`}
                          >
                            {status.label}
                          </span>
                          {canEdit ? (
                            <Link
                              className="flex items-center gap-1 rounded-full border border-[color:var(--sbx-line)] px-3 py-1.5 text-[12px]"
                              href={`/criador-de-sites/${site.id}`}
                            >
                              <ExternalLink className="size-[12px]" />
                              Abrir
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <>
              <label className="flex h-10 items-center gap-2 rounded-full border border-[color:var(--sbx-line)] bg-[color:var(--sbx-card)] px-3.5">
                <Search className="size-[15px] text-[color:var(--sbx-faint)]" />
                <input
                  autoFocus
                  className="flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-[color:var(--sbx-faint)]"
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Nome ou e-mail do cliente..."
                  value={query}
                />
                {loading ? <Loader className="size-4 animate-spin" /> : null}
              </label>
              <div className="flex max-h-[44vh] flex-col gap-2 overflow-auto">
                {clients.length === 0 && !loading ? (
                  <p className="p-6 text-center text-[color:var(--sbx-mute)] text-sm">
                    Nenhum cliente encontrado.
                  </p>
                ) : (
                  clients.map(c => (
                    <button
                      className={row}
                      key={c.id}
                      onClick={() => void pick(c)}
                      type="button"
                    >
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate font-medium">{c.name}</span>
                        <span className="truncate text-[color:var(--sbx-mute)] text-xs">
                          {c.email}
                        </span>
                      </div>
                      <span className="shrink-0 text-[color:var(--sbx-mute)] text-xs">
                        {c.siteCount === 1 ? "1 site" : `${c.siteCount} sites`}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </>
          )}

          {error ? (
            <p className="text-[13px] text-destructive">{error}</p>
          ) : null}

          {admins && admins.length > 0 ? (
            <div className="flex flex-col gap-2.5 rounded-[10px] border border-[color:var(--sbx-line)] bg-[color:var(--sbx-card)] p-3.5">
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-sm">
                  Como validar as alterações dos seus admins
                </span>
                <span className="text-[color:var(--sbx-mute)] text-xs">
                  Automática: vale na hora. Com o cliente ou com você: o admin
                  envia, você ou o dono vê o que mudou e aprova ou pede ajustes.
                </span>
              </div>
              {admins.map(admin => (
                <div
                  className="flex flex-wrap items-center justify-between gap-2 text-sm"
                  key={admin.id}
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate">{admin.name}</span>
                    <span className="truncate text-[color:var(--sbx-mute)] text-xs">
                      {admin.email}
                    </span>
                  </div>
                  <select
                    aria-label={`Validação das alterações de ${admin.name}`}
                    className="h-9 rounded-[10px] border border-[color:var(--sbx-line)] bg-[color:var(--sbx-card)] px-2.5 text-[13px] dark:[color-scheme:dark]"
                    onChange={e =>
                      void changeMode(
                        admin.id,
                        e.target.value as ValidationMode
                      )
                    }
                    value={admin.mode}
                  >
                    <option value="auto">Automática (padrão)</option>
                    <option value="owner">Validar com o cliente</option>
                    <option value="master">Validar com o Lucas</option>
                  </select>
                </div>
              ))}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
