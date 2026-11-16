import type { TemplateThumb } from "@/lib/site-builder/template-thumbs";

/**
 * Miniatura pré-gerada do template (WebP ~20 KB) no lugar do site inteiro renderizado. O cartão é `relative`
 * com proporção 4:3; a imagem preenche. O navegador só baixa as de baixo quando elas chegam perto da tela.
 */
export function TemplateThumbImage({
  alt,
  thumb,
}: {
  alt: string;
  thumb: TemplateThumb;
}) {
  return (
    // biome-ignore lint/performance/noImgElement: arquivo estático pré-gerado; o `next/image` aqui só somaria um proxy
    <img
      alt={alt}
      className="absolute inset-0 size-full object-cover object-top"
      decoding="async"
      height={thumb.h}
      loading="lazy"
      src={thumb.src}
      width={thumb.w}
    />
  );
}
