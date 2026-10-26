import { getTemplate, listTemplates, SiteRenderer } from "@repo/site-builder";
import { LayoutTemplate } from "lucide-react";
import type { Metadata } from "next";
import { requireBuilderUser } from "@/lib/site-builder/access";
import { AutoScroll } from "../components/AutoScroll";
import { FitSite } from "../components/FitSite";
import { Frame } from "../components/Frame";
import TemplateGallery, {
  type GalleryTemplate,
} from "./components/TemplateGallery";

export const metadata: Metadata = {
  title: "Novo site - Atlas Hosting",
};

export default async function NewSitePage() {
  await requireBuilderUser();

  const templates: GalleryTemplate[] = listTemplates().flatMap(meta => {
    const full = getTemplate(meta.id);
    if (!full) return [];
    return [
      {
        description: meta.description,
        id: meta.id,
        name: meta.name,
        pageCount: meta.pageCount,
        preview: (
          <AutoScroll speed={200}>
            <FitSite>
              <SiteRenderer path="/" site={full.site} />
            </FitSite>
          </AutoScroll>
        ),
        previewBackground: full.site.theme.bg ?? "#030712",
        tags: meta.tags,
        thumb: (
          <AutoScroll speed={50}>
            <FitSite>
              <SiteRenderer path="/" site={full.site} />
            </FitSite>
          </AutoScroll>
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
