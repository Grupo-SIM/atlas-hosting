"use client";

import { useEffect, useRef } from "react";

export interface ConfirmRequest {
  confirmLabel?: string;
  message: string;
  onConfirm: () => void;
  title: string;
}

/** Confirmação em modal no centro da tela (nunca `window.confirm`). */
export function ConfirmDialog({
  onClose,
  request,
}: {
  onClose: () => void;
  request: ConfirmRequest;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  useEffect(() => confirmRef.current?.focus(), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: clicar no fundo fecha o modal
    <div
      className="sbe-modal"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div aria-modal="true" className="sbe-dialog sbe-confirm" role="dialog">
        <header>
          <div>
            <h3>{request.title}</h3>
            <p>{request.message}</p>
          </div>
        </header>
        <footer>
          <button className="sbe-btn" onClick={onClose} type="button">
            Cancelar
          </button>
          <button
            className="sbe-btn danger"
            onClick={() => {
              onClose();
              request.onConfirm();
            }}
            ref={confirmRef}
            type="button"
          >
            {request.confirmLabel ?? "Confirmar"}
          </button>
        </footer>
      </div>
    </div>
  );
}
