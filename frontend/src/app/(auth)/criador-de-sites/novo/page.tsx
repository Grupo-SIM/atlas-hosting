import { getTemplate, listTemplates } from "@repo/site-builder";
import { LayoutTemplate } from "lucide-react";
import type { Metadata } from "next";
import { requireBuilderUser } from "@/lib/site-builder/access";
import { Frame } from "../components/Frame";
import { ScaledSite } from "../components/ScaledSite";
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
        preview: <ScaledSite scale={0.62} site={full.site} />,
        previewBackground: full.site.theme.bg ?? "#030712",
        tags: meta.tags,
        thumb: <ScaledSite scale={0.28} site={full.site} />,
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
