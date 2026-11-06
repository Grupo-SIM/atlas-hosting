"use client";

import type { Site } from "@repo/site-builder";
import { type AiConfig, SiteEditor } from "@repo/site-builder/editor";
import { useState } from "react";
import {
  resolveYoutubeChannel,
  saveSite,
  uploadSiteFont,
  uploadSiteImage,
  uploadSiteVideo,
} from "../../actions";
import {
  disconnectAi,
  finishAiLogin,
  getAiStatus,
  startAiLogin,
} from "../../ai-actions";
import { republishSite } from "../../publish-actions";
import PublishSetupModal, {
  type PublishSetup,
  slug,
} from "./PublishSetupModal";

/** Lê o chat da IA: uma linha JSON por evento (`/api/site-builder/ai/chat`). */
async function streamChat(
  input: Parameters<AiConfig["chat"]>[0],
  onEvent: Parameters<AiConfig["chat"]>[1],
  signal: AbortSignal
) {
  const res = await fetch("/api/site-builder/ai/chat", {
    body: JSON.stringify(input),
    headers: { "content-type": "application/json" },
    method: "POST",
    signal,
  });
  if (!(res.ok && res.body)) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Falha ao falar com a Atlas IA.");
  }
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += value;
    let at = buffer.indexOf("\n");
    while (at >= 0) {
      const line = buffer.slice(0, at).trim();
      buffer = buffer.slice(at + 1);
      if (line) onEvent(JSON.parse(line));
      at = buffer.indexOf("\n");
    }
  }
}

// Fora do componente: o editor refaz a checagem de conexão se esta referência mudar.
const aiConfig: AiConfig = {
  chat: streamChat,
  disconnect: disconnectAi,
  finishLogin: finishAiLogin,
  startLogin: startAiLogin,
  status: getAiStatus,
};

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
        ai={aiConfig}
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
