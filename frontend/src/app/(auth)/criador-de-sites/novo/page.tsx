import {
  getTemplate,
  listTemplates,
  SiteRenderer,
  thumbnailSite,
} from "@repo/site-builder";
import { LayoutTemplate } from "lucide-react";
import type { Metadata } from "next";
import { isMasterAdmin, requireBuilderUser } from "@/lib/site-builder/access";
import { getTemplateOverrides } from "@/lib/site-builder/templates";
import {
  getResaleConfig,
  getTemplateExclusivityMap,
} from "@/lib/template-exclusivity/status";
import { Frame } from "../components/Frame";
import { StaticThumb } from "../components/StaticThumb";
import TemplateGallery, {
  type GalleryTemplate,
} from "./components/TemplateGallery";

export const metadata: Metadata = {
  title: "Novo site - Atlas Hosting",
};

export default async function NewSitePage() {
  const user = await requireBuilderUser();
  const master = isMasterAdmin(user);
  const [exclusivity, resale, overrides] = await Promise.all([
    getTemplateExclusivityMap(user.id),
    getResaleConfig(),
    getTemplateOverrides(),
  ]);

  const templates: GalleryTemplate[] = listTemplates().flatMap(meta => {
    const full = getTemplate(meta.id);
    if (!full) return [];
    // A versão editada pelo admin master vale para todos (galeria e sites novos).
    const site = overrides[meta.id] ?? full.site;
    return [
      {
        description: meta.description,
        exclusivity: exclusivity[meta.id]
          ? { ...exclusivity[meta.id], feePercent: resale.feePercent }
          : undefined,
        id: meta.id,
        master: master ? { edited: meta.id in overrides } : undefined,
        name: meta.name,
        pageCount: meta.pageCount,
        previewBackground: site.theme.bg ?? "#030712",
        tags: meta.tags,
        thumb: (
          <StaticThumb>
            <SiteRenderer
              path="/"
              site={thumbnailSite(site)}
              skipFxRuntime
              thumbnail
            />
          </StaticThumb>
        ),
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
        <TemplateGallery templates={templates} />
      </div>
    </Frame>
  );
}
