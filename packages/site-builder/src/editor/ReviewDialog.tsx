"use client";

import { useState } from "react";
import { Icon } from "./icons.js";
import type { ChangeEntry } from "./types.js";

export interface PublishConfig {
  /** Pede a senha SSH da VPS (publicação em VPS do usuário). */
  askPassword?: boolean;
  /** Endereço atual do site; `null` quando ainda não foi publicado. */
  domain: string | null;
  /** Se o endereço já abre; o app confere e o editor só mostra. Ausente = sem indicador. */
  liveStatus?: "checking" | "live" | "no_dns" | "no_site";
  /** Abre a configuração de endereço/servidor (modal do app) quando ainda não há publicação. */
  onSetup?: () => void;
  /** Alternativa à `onSetup`: para onde ir definir o endereço. */
  setupHref?: string;
}

interface Props {
  changes: ChangeEntry[];
  error: string;
  onClose: () => void;
  onPick: (id: string) => void;
  onPublish: (password?: string) => void;
  publish: PublishConfig;
  publishing: boolean;
  subtitle: string;
}

/** Modal "Revisar e publicar": lista o que mudou e publica no endereço do site. */
export function ReviewDialog({
  changes,
  error,
  onClose,
  onPick,
  onPublish,
  publish,
  publishing,
  subtitle,
}: Props) {
  const [password, setPassword] = useState("");
  const rows = changes.slice().reverse();

  return (
    <div className="sbe-scrim">
      <div className="sbe-dialog">
        <header>
          <div>
            <h3>Revisar e publicar</h3>
            <p>{subtitle} desde a última publicação</p>
          </div>
          <button
            className="sbe-ibtn"
            onClick={onClose}
            title="Fechar"
            type="button"
          >
            <Icon name="x" size={16} />
          </button>
        </header>
        <div className="body">
          <h4 className="sbe-h">Alterações</h4>
          {rows.length > 0 ? (
            <div className="sbe-log">
              {rows.map((c, i) => (
                <button
                  // biome-ignore lint/suspicious/noArrayIndexKey: o log só cresce e as linhas repetem rótulo
                  key={i}
                  onClick={() => c.id && onPick(c.id)}
                  style={{ cursor: c.id ? "pointer" : "default" }}
                  type="button"
                >
                  <span className={`sbe-kind ${c.kind}`}>{c.kind}</span>
                  <span className="lbl">{c.label}</span>
                  {c.id ? (
                    <Icon
                      name="crosshair"
                      size={14}
                      style={{ color: "#9a968e" }}
                    />
                  ) : null}
                </button>
              ))}
            </div>
          ) : (
            <p className="sbe-hint">
              Nenhuma alteração ainda. Edite algo no preview.
            </p>
          )}
        </div>
        <div className="sbe-target">
          <Icon name="globe" size={14} style={{ color: "#55524c" }} />
          {publish.domain ? (
            <span>
              Publicar em <b style={{ fontWeight: 500 }}>{publish.domain}</b>
            </span>
          ) : (
            <span>Este site ainda não tem um endereço.</span>
          )}
        </div>
        {publish.domain && publish.askPassword ? (
          <div className="body" style={{ paddingBottom: 0 }}>
            <label className="sbe-field">
              <span>
                Senha do servidor (root) — usada só agora, não é gravada
              </span>
              <input
                autoComplete="off"
                onChange={e => setPassword(e.target.value)}
                type="password"
                value={password}
              />
            </label>
          </div>
        ) : null}
        {error ? (
          <div className="body" style={{ paddingBottom: 0 }}>
            <p className="sbe-hint sbe-error">{error}</p>
          </div>
        ) : null}
        <footer>
          <button className="sbe-btn round" onClick={onClose} type="button">
            Continuar editando
          </button>
          {publish.domain ? (
            <button
              className="sbe-btn round sbe-lime"
              disabled={publishing}
              onClick={() => onPublish(password || undefined)}
              type="button"
            >
              <Icon name="rocket" size={14} />
              {publishing ? "Publicando..." : "Publicar agora"}
            </button>
          ) : publish.onSetup ? (
            <button
              className="sbe-btn round sbe-lime"
              onClick={publish.onSetup}
              type="button"
            >
              <Icon name="rocket" size={14} />
              Definir endereço e publicar
            </button>
          ) : (
            <a
              className="sbe-btn round sbe-lime"
              href={publish.setupHref}
              style={{ textDecoration: "none" }}
            >
              <Icon name="rocket" size={14} />
              Definir endereço
            </a>
          )}
        </footer>
      </div>
    </div>
  );
}
