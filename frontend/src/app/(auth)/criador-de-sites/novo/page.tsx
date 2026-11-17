import {
  listTemplates,
  listWordpressTemplates,
  peekTemplate,
  SiteRenderer,
  thumbnailSite,
  wordpressSourceId,
} from "@repo/site-builder";
import { LayoutTemplate } from "lucide-react";
import type { Metadata } from "next";
import { hasAreaAccess } from "@/lib/permissions/access";
import {
  canUseWordpressTemplates,
  requireBuilderUser,
} from "@/lib/site-builder/access";
import { templateThumb } from "@/lib/site-builder/template-thumbs";
import {
  getTemplateDrafts,
  getTemplateOverrides,
} from "@/lib/site-builder/templates";
import {
  getResaleConfig,
  getTemplateExclusivityMap,
} from "@/lib/template-exclusivity/status";
import { Frame } from "../components/Frame";
import { StaticThumb } from "../components/StaticThumb";
import TemplateGallery, {
  type GalleryTemplate,
} from "./components/TemplateGallery";
import { TemplateThumbImage } from "./components/TemplateThumbImage";

export const metadata: Metadata = {
  title: "Novo site - Atlas Hosting",
};

export default async function NewSitePage() {
  const user = await requireBuilderUser();
  // Admin master e quem ele liberou veem a chave do modo Dev (editar os templates de demonstração).
  const devAvailable = await hasAreaAccess(user, "admin_templates", "edit");
  const [exclusivity, resale, overrides, drafts] = await Promise.all([
    getTemplateExclusivityMap(user.id),
    getResaleConfig(),
    getTemplateOverrides(),
    // Rascunhos do modo Dev só importam para quem edita templates.
    devAvailable ? getTemplateDrafts() : Promise.resolve({}),
  ]);

  // Cópias para sites importados do WordPress: só o admin master e quem ele liberou.
  const wordpress = await canUseWordpressTemplates(user);
  const metas = [
    ...listTemplates().map(meta => ({ meta, wordpress: false })),
    ...(wordpress
      ? listWordpressTemplates().map(meta => ({ meta, wordpress: true }))
      : []),
  ];

  const templates: GalleryTemplate[] = metas.flatMap(({ meta, wordpress }) => {
    // Só leitura (sem clonar o site inteiro de cada template a cada requisição).
    const full = peekTemplate(meta.id);
    if (!full) return [];
    // A versão editada pelo admin master vale para todos (galeria e sites novos).
    const edited = overrides[meta.id];
    const site = edited ?? full.site;
    // Imagem pré-gerada enquanto o template não foi editado nem mudou; senão a miniatura ao vivo.
    // A cópia do WordPress começa igual ao original, então reaproveita a imagem dele.
    const image = edited ? null : templateThumb(wordpressSourceId(meta.id));
    return [
      {
        exclusivity: exclusivity[meta.id]
          ? { ...exclusivity[meta.id], feePercent: resale.feePercent }
          : undefined,
        id: meta.id,
        master: devAvailable
          ? { draft: meta.id in drafts, edited: meta.id in overrides }
          : undefined,
        name: meta.name,
        previewBackground: site.theme.bg ?? "#030712",
        tags: wordpress ? meta.tags.filter(t => t !== "WordPress") : meta.tags,
        thumb: image ? (
          <TemplateThumbImage
            alt={`Prévia do template ${meta.name}`}
            thumb={image}
          />
        ) : (
          <StaticThumb>
            <SiteRenderer
              path="/"
              site={thumbnailSite(site)}
              skipFxRuntime
              thumbnail
            />
          </StaticThumb>
        ),
        wordpress,
      },
    ];
  });

  return (
    <Frame
      closeHref="/criador-de-sites"
      crumbs={[
        { href: "/criador-de-sites", label: "Sites" },
        { label: "Novo site" },
      ]}
      icon={<LayoutTemplate className="size-[15px]" />}
      step={1}
    >
      <div className="flex-1 overflow-auto px-5 pt-9 pb-20 md:px-10">
        <TemplateGallery devAvailable={devAvailable} templates={templates} />
      </div>
    </Frame>
  );
}
