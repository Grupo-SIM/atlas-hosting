"use client";

import type { Site } from "@repo/site-builder";
import { SiteEditor } from "@repo/site-builder/editor";
import {
  resolveYoutubeChannel,
  saveSite,
  uploadSiteImage,
} from "../../actions";
import { republishSite } from "../../publish-actions";

export default function SiteEditorClient({
  domain,
  initialSite,
  originalSite,
  publishWithPassword,
  siteId,
}: {
  /** Endereço da última publicação; `null` se o site nunca foi publicado. */
  domain: string | null;
  initialSite: Site;
  originalSite?: Site;
  /** A última publicação foi numa VPS do usuário, que pode exigir a senha SSH. */
  publishWithPassword: boolean;
  siteId: string;
}) {
  return (
    <SiteEditor
      basePath={`/criador-de-sites/${siteId}`}
      exitHref="/criador-de-sites"
      initialSite={initialSite}
      onPublish={(_site, password) => republishSite({ password, siteId })}
      onResolveChannel={async input => {
        const result = await resolveYoutubeChannel(input);
        if (!result.ok) throw new Error(result.error);
        return { id: result.id, name: result.name };
      }}
      onSave={site => saveSite(siteId, site)}
      onUploadImage={async file => {
        const data = new FormData();
        data.append("file", file);
        const result = await uploadSiteImage(data);
        if (!result.ok) throw new Error(result.error);
        return result.url;
      }}
      originalSite={originalSite}
      publish={{
        askPassword: publishWithPassword,
        domain,
        setupHref: `/criador-de-sites/${siteId}/publicar`,
      }}
      storageKey={siteId}
    />
  );
}
