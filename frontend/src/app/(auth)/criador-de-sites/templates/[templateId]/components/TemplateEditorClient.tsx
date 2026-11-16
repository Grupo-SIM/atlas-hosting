"use client";

import type { Site } from "@repo/site-builder";
import { SiteEditor } from "@repo/site-builder/editor";
import { aiConfig } from "../../../[siteId]/components/SiteEditorClient";
import {
  resolveYoutubeChannel,
  uploadSiteFont,
  uploadSiteImage,
  uploadSiteVideo,
} from "../../../actions";
import { saveTemplateOverride } from "../../../template-actions";

/** Editor do template (admin master): salva a versão editada do template, sem publicar nada. */
export default function TemplateEditorClient({
  initialSite,
  originalSite,
  templateId,
  templateName,
}: {
  initialSite: Site;
  /** Template do código, para "Restaurar original". */
  originalSite: Site;
  templateId: string;
  templateName: string;
}) {
  return (
    <SiteEditor
      ai={aiConfig}
      banner={
        <>
          <code>{"</>"}</code>
          <b>MODO DEV</b> · Você está editando o template{" "}
          <b>“{templateName}”</b>, que é uma <b>demonstração</b>. O que você
          salvar vale para todo site criado a partir dele daqui para frente;
          sites que já foram criados não mudam. “Restaurar original” volta ao
          template do código.
        </>
      }
      basePath={`/criador-de-sites/templates/${templateId}`}
      exitHref="/criador-de-sites/novo"
      initialSite={initialSite}
      onResolveChannel={async input => {
        const result = await resolveYoutubeChannel(input);
        if (!result.ok) throw new Error(result.error);
        return { id: result.id, name: result.name };
      }}
      onSave={site => saveTemplateOverride(templateId, site)}
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
        const result = file.type.startsWith("video/")
          ? await uploadSiteVideo(data)
          : await uploadSiteImage(data);
        if (!result.ok) throw new Error(result.error);
        return result.url;
      }}
      originalSite={originalSite}
      storageKey={`template:${templateId}`}
    />
  );
}
