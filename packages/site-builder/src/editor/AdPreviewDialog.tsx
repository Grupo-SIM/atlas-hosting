"use client";

import { useEffect, useState } from "react";
import type { AdSpec } from "../blocks/ads.js";
import { formatSize, UPLOAD_LIMIT_MB } from "../upload-limits.js";
import { coverCrop, ratioLabel } from "./ad-crop.js";

const SIZE_NAMES: Record<AdSpec["size"], string> = {
  banner: "Faixa larga",
  side: "Coluna lateral",
  square: "Quadrado",
};

/** Lê as dimensões da mídia (imagem ou vídeo) no navegador; `null` enquanto carrega, `"erro"` se não abrir. */
function useMediaSize(src: string, isVideo: boolean) {
  const [size, setSize] = useState<{ h: number; w: number } | "erro" | null>(
    null
  );
  useEffect(() => {
    setSize(null);
    if (isVideo) {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () =>
        setSize(
          v.videoWidth && v.videoHeight
            ? { h: v.videoHeight, w: v.videoWidth }
            : "erro"
        );
      v.onerror = () => setSize("erro");
      v.src = src;
      return () => {
        v.onloadedmetadata = null;
        v.onerror = null;
        v.src = "";
      };
    }
    const img = new Image();
    img.onload = () =>
      // SVG sem tamanho próprio vem com 0: nesse caso ele se ajusta ao espaço, sem corte a mostrar.
      setSize({ h: img.naturalHeight || 0, w: img.naturalWidth || 0 });
    img.onerror = () => setSize("erro");
    img.src = src;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, isVideo]);
  return size;
}

/**
 * Prévia de como uma mídia fica num espaço de anúncio: à esquerda o espaço do site (com o corte que o
 * `object-fit: cover` faz), à direita a imagem inteira com a parte que aparece destacada. No modo "confirm" a mídia
 * ainda não foi enviada e a pessoa decide se usa; no "view" só olha a que já está lá.
 */
export function AdPreviewDialog({
  busy = false,
  fileSize,
  isVideo,
  mode,
  onClose,
  onConfirm,
  spec,
  src,
}: {
  busy?: boolean;
  /** Tamanho do arquivo escolhido (só no modo "confirm"). */
  fileSize?: number;
  isVideo: boolean;
  mode: "confirm" | "view";
  onClose: () => void;
  onConfirm?: () => void;
  spec: AdSpec;
  src: string;
}) {
  const size = useMediaSize(src, isVideo);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const dims =
    size && size !== "erro" && size.w > 0 && size.h > 0 ? size : null;
  const crop = dims ? coverCrop(dims, spec) : null;
  const slotWidth = spec.w >= 600 ? 460 : 230;
  const media = (full: boolean) =>
    isVideo ? (
      <video
        autoPlay
        className={full ? "sbe-adprev-media full" : "sbe-adprev-media"}
        loop
        muted
        playsInline
        src={src}
      />
    ) : (
      // biome-ignore lint/performance/noImgElement: prévia local da mídia escolhida
      <img
        alt=""
        className={full ? "sbe-adprev-media full" : "sbe-adprev-media"}
        src={src}
      />
    );

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: clicar no fundo fecha o modal
    <div
      className="sbe-modal"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div aria-modal="true" className="sbe-dialog sbe-adprev" role="dialog">
        <header>
          <div>
            <h3>Como vai aparecer no site</h3>
            <p>
              {SIZE_NAMES[spec.size]} · tamanho ideal{" "}
              <b>
                {spec.w} × {spec.h} px
              </b>{" "}
              ({ratioLabel(spec.w, spec.h)}). O que passar das bordas é cortado,
              sempre a partir do centro.
            </p>
          </div>
        </header>

        <div className="sbe-adprev-body">
          <section>
            <h4>
              No site ({spec.w} × {spec.h})
            </h4>
            <div
              className="sbe-adprev-slot"
              style={{
                aspectRatio: `${spec.w} / ${spec.h}`,
                maxWidth: slotWidth,
              }}
            >
              {media(false)}
            </div>
          </section>
          <section>
            <h4>
              Imagem inteira
              {dims ? ` (${dims.w} × ${dims.h})` : ""}
            </h4>
            <div
              className="sbe-adprev-whole"
              style={{
                aspectRatio: dims
                  ? `${dims.w} / ${dims.h}`
                  : `${spec.w} / ${spec.h}`,
              }}
            >
              {media(true)}
              {dims && crop && crop.cuts !== "none" ? (
                <i
                  aria-hidden="true"
                  className="sbe-adprev-keep"
                  style={{
                    height: `${(crop.rect.h / dims.h) * 100}%`,
                    left: `${(crop.rect.x / dims.w) * 100}%`,
                    top: `${(crop.rect.y / dims.h) * 100}%`,
                    width: `${(crop.rect.w / dims.w) * 100}%`,
                  }}
                />
              ) : null}
            </div>
            <small className="sbe-adprev-cap">
              {crop && crop.cuts !== "none"
                ? "A área clara é a que aparece; o escuro é cortado."
                : "Cabe inteira, sem corte."}
            </small>
          </section>
        </div>

        <ul className="sbe-adprev-facts">
          {size === null ? <li>Lendo a mídia…</li> : null}
          {size === "erro" ? (
            <li className="warn">
              Não foi possível abrir esta mídia para calcular o corte.
            </li>
          ) : null}
          {crop ? (
            <li>
              Aparece <b>{crop.visiblePercent}%</b> da imagem
              {crop.cuts === "sides"
                ? ": corta dos lados."
                : crop.cuts === "top-bottom"
                  ? ": corta em cima e embaixo."
                  : "."}
            </li>
          ) : null}
          {crop && crop.visiblePercent < 50 ? (
            <li className="warn">
              Boa parte da imagem será cortada. Para aparecer inteira, use uma
              imagem na proporção {ratioLabel(spec.w, spec.h)} (por exemplo{" "}
              {spec.w} × {spec.h} px).
            </li>
          ) : null}
          {dims && dims.w < spec.w ? (
            <li className="warn">
              A imagem é menor que o tamanho ideal ({spec.w} px de largura) e
              pode ficar sem nitidez. Imagens maiores, na mesma proporção, ficam
              mais nítidas.
            </li>
          ) : null}
          {spec.note ? <li>{spec.note}</li> : null}
          {fileSize ? (
            <li>
              Arquivo: {formatSize(fileSize)} (limite{" "}
              {isVideo ? UPLOAD_LIMIT_MB.video : UPLOAD_LIMIT_MB.image} MB).
            </li>
          ) : null}
        </ul>

        <footer>
          {mode === "confirm" ? (
            <>
              <button
                className="sbe-btn"
                disabled={busy}
                onClick={onClose}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="sbe-lime"
                disabled={busy || size === "erro"}
                onClick={onConfirm}
                type="button"
              >
                {busy ? "Enviando…" : "Usar esta mídia"}
              </button>
            </>
          ) : (
            <button className="sbe-btn" onClick={onClose} type="button">
              Fechar
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
