"use client";

import type { Site } from "@repo/site-builder";
import { SiteEditor } from "@repo/site-builder/editor";
import Link from "next/link";
import { saveSite, uploadSiteImage } from "../../actions";

export default function SiteEditorClient({
  initialSite,
  siteId,
}: {
  initialSite: Site;
  siteId: string;
}) {
  return (
    <SiteEditor
      basePath={`/criador-de-sites/${siteId}`}
      initialSite={initialSite}
      onSave={site => saveSite(siteId, site)}
      onUploadImage={async file => {
        const data = new FormData();
        data.append("file", file);
        const result = await uploadSiteImage(data);
        if (!result.ok) throw new Error(result.error);
        return result.url;
      }}
      toolbarExtra={({ dirty }) =>
        dirty ? (
          <span style={{ fontSize: 12 }}>Salve para publicar</span>
        ) : (
          <Link
            href={`/criador-de-sites/${siteId}/publicar`}
            style={{
              border: "1px solid #cbd0d8",
              borderRadius: 6,
              fontSize: 14,
              padding: "5px 10px",
            }}
          >
            Publicar
          </Link>
        )
      }
    />
  );
}
