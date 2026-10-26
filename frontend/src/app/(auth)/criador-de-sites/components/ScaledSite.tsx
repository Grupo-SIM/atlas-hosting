import { type Site, SiteRenderer } from "@repo/site-builder";

/**
 * Miniatura ao vivo do site: renderiza a home em 900px e reduz com `transform`.
 * O contêiner que usa precisa ter altura fixa e `overflow-hidden`.
 */
export function ScaledSite({
  scale,
  site,
  width = 900,
}: {
  scale: number;
  site: Site;
  width?: number;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        pointerEvents: "none",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        width,
      }}
    >
      <SiteRenderer path="/" site={site} />
    </div>
  );
}
