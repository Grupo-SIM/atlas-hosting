import {
  getTemplate,
  listTemplates,
  SiteRenderer,
  thumbnailSite,
} from "@repo/site-builder";
import { LayoutTemplate } from "lucide-react";
import type { Metadata } from "next";
import { requireBuilderUser } from "@/lib/site-builder/access";
import {
  getResaleConfig,
  getTemplateExclusivityMap,
} from "@/lib/template-exclusivity/status";
import { Frame } from "../components/Frame";
import { LiveThumb } from "../components/LiveThumb";
import TemplateGallery, {
  type GalleryTemplate,
} from "./components/TemplateGallery";

export const metadata: Metadata = {
  title: "Novo site - Atlas Hosting",
};

export default async function NewSitePage() {
  const user = await requireBuilderUser();
  const [exclusivity, resale] = await Promise.all([
    getTemplateExclusivityMap(user.id),
    getResaleConfig(),
  ]);

  const templates: GalleryTemplate[] = listTemplates().flatMap(meta => {
    const full = getTemplate(meta.id);
    if (!full) return [];
    return [
      {
        description: meta.description,
        exclusivity: exclusivity[meta.id]
          ? { ...exclusivity[meta.id], feePercent: resale.feePercent }
          : undefined,
        id: meta.id,
        name: meta.name,
        pageCount: meta.pageCount,
        previewBackground: full.site.theme.bg ?? "#030712",
        tags: meta.tags,
        thumb: (
          <LiveThumb>
            <SiteRenderer
              path="/"
              site={thumbnailSite(full.site)}
              skipFxRuntime
              thumbnail
            />
          </LiveThumb>
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
