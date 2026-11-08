"use client";

import { useEffect } from "react";

/** Só players que o próprio renderer gera para `data-sb-video` (YouTube sem cookies ou Vimeo). */
const PLAYER =
  /^https:\/\/(www\.youtube-nocookie\.com\/embed\/|player\.vimeo\.com\/video\/)/;

export const isPopupPlayer = (src: string): boolean => PLAYER.test(src);

/**
 * Vídeo de um botão com popup (`a[data-sb-video]`), aberto no editor com Ctrl/Cmd + clique — o mesmo
 * que o visitante vê no site publicado. Fecha no ×, no Esc ou clicando fora.
 */
export function VideoPopup({
  label,
  onClose,
  src,
}: {
  label: string;
  onClose: () => void;
  src: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!isPopupPlayer(src)) return null;
  const player = `${src}${src.includes("?") ? "&" : "?"}autoplay=1&playsinline=1&rel=0`;
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: clicar no fundo fecha o vídeo
    <div
      className="sbe-modal sbe-vpop"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        aria-label={label}
        aria-modal="true"
        className="sbe-vpop-stage"
        role="dialog"
      >
        <button
          aria-label="Fechar"
          className="sbe-vpop-close"
          onClick={onClose}
          type="button"
        >
          ×
        </button>
        <iframe
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          src={player}
          title={label}
        />
      </div>
    </div>
  );
}
