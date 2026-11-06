"use client";

import type { Site } from "@repo/site-builder";
import { SiteEditor } from "@repo/site-builder/editor";
import { useState } from "react";
import {
  resolveYoutubeChannel,
  saveSite,
  uploadSiteFont,
  uploadSiteImage,
  uploadSiteVideo,
} from "../../actions";
import { republishSite } from "../../publish-actions";
import PublishSetupModal, {
  type PublishSetup,
  slug,
} from "./PublishSetupModal";

export default function SiteEditorClient({
  domain,
  initialSite,
  originalSite,
  publishSetup,
  publishWithPassword,
  siteId,
}: {
  /** Endereço da última publicação; `null` se o site nunca foi publicado. */
  domain: string | null;
  initialSite: Site;
  originalSite?: Site;
  /** Dados do modal de endereço e servidor (aberto ao publicar pela primeira vez). */
  publishSetup: PublishSetup;
  /** A última publicação foi numa VPS do usuário, que pode exigir a senha SSH. */
  publishWithPassword: boolean;
  siteId: string;
}) {
  const [setupOpen, setSetupOpen] = useState(false);

  return (
    <>
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
        onUploadFont={async file => {
          const data = new FormData();
          data.append("file", file);
          const result = await uploadSiteFont(data);
          if (!result.ok) throw new Error(result.error);
          return { name: result.name, url: result.url };
        }}
        onUploadImage={async file => {
          const data = new FormData();
          data.append("file", file);
          // Anúncios aceitam vídeo: o mesmo campo de envio escolhe a ação pelo tipo do arquivo.
          const result = file.type.startsWith("video/")
            ? await uploadSiteVideo(data)
            : await uploadSiteImage(data);
          if (!result.ok) throw new Error(result.error);
          return result.url;
        }}
        originalSite={originalSite}
        publish={{
          askPassword: publishWithPassword,
          domain,
          onSetup: () => setSetupOpen(true),
        }}
        storageKey={siteId}
      />
      <PublishSetupModal
        {...publishSetup}
        defaultLabel={slug(initialSite.name)}
        onOpenChange={setSetupOpen}
        open={setupOpen}
        siteId={siteId}
      />
    </>
  );
}
