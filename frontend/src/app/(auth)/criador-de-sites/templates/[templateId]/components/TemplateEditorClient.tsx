"use client";

import type { Site } from "@repo/site-builder";
import { SiteEditor } from "@repo/site-builder/editor";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { friendlyError } from "@/lib/site-builder/stale-action";
import { aiConfig } from "../../../[siteId]/components/SiteEditorClient";
import { resolveYoutubeChannel, uploadSiteFont } from "../../../actions";
import { uploadSiteMedia } from "../../../components/upload-media";
import {
  discardTemplateDraft,
  publishTemplateDraft,
  saveTemplateDraft,
} from "../../../template-actions";

/**
 * Editor do template (modo Dev). Tudo o que se edita vai para um **rascunho** (salvo sozinho) que só quem edita vê;
 * "Publicar no template" torna a versão fixa: daí em diante quem clicar em "Usar este template" recebe esta versão para
 * customizar. Toda vez que se entra, um aviso pede confirmação.
 */
export default function TemplateEditorClient({
  hasDraft: initialDraft,
  hasPublished: initialPublished,
  initialSite,
  originalSite,
  templateId,
  templateName,
}: {
  /** Já existe rascunho salvo (o editor abre nele). */
  hasDraft: boolean;
  /** Já existe uma versão publicada (diferente do template do código). */
  hasPublished: boolean;
  initialSite: Site;
  /** Template do código, para "Restaurar original". */
  originalSite: Site;
  templateId: string;
  templateName: string;
}) {
  const router = useRouter();
  // O aviso volta toda vez que a página abre: o estado não é guardado em lugar nenhum.
  const [entered, setEntered] = useState(false);
  const [hasDraft, setHasDraft] = useState(initialDraft);
  const [hasPublished, setHasPublished] = useState(initialPublished);
  const [confirm, setConfirm] = useState<"discard" | "publish" | null>(null);
  const [pending, startTransition] = useTransition();

  const publish = () =>
    startTransition(async () => {
      const result = await publishTemplateDraft(templateId);
      setConfirm(null);
      if (result.ok) {
        setHasDraft(false);
        setHasPublished(true);
        toast.success(
          "Template publicado: quem usar este template agora recebe esta versão."
        );
      } else {
        toast.error(result.error);
      }
    });

  const discard = () =>
    startTransition(async () => {
      const result = await discardTemplateDraft(templateId);
      setConfirm(null);
      if (result.ok) {
        toast.success("Rascunho descartado.");
        // O editor guarda o conteúdo em memória: recarrega para abrir na versão fixa.
        window.location.reload();
      } else {
        toast.error(result.error);
      }
    });

  const status = hasDraft
    ? "Rascunho salvo, mas NÃO publicado: os clientes ainda veem a versão anterior"
    : hasPublished
      ? "Sem alterações novas — a versão publicada é a que os clientes recebem"
      : "Sem alterações — vale o template original";

  return (
    <>
      <SiteEditor
        ai={aiConfig}
        banner={
          <div className="sbe-devbar">
            <div>
              <code>{"</>"}</code>
              <b>MODO DEV</b> · Editando o template <b>“{templateName}”</b>, uma{" "}
              <b>demonstração</b>. As alterações ficam em <b>rascunho</b> (só
              quem edita vê). Clique em <b>Publicar no template</b> para
              torná-las fixas: depois disso, quem usar o template recebe esta
              versão. Sites já criados não mudam.
              <span className="sbe-devstatus">{status}</span>
            </div>
            <div className="sbe-devactions">
              <a
                className="sbe-btn"
                href={`/criador-de-sites/preview/${templateId}`}
                rel="noreferrer"
                target="_blank"
                title="Abre a prévia do rascunho em outra aba"
              >
                Pré-visualizar rascunho
              </a>
              <button
                className="sbe-lime"
                disabled={!hasDraft || pending}
                onClick={() => setConfirm("publish")}
                type="button"
              >
                Publicar no template
              </button>
              <button
                className="sbe-btn"
                disabled={!hasDraft || pending}
                onClick={() => setConfirm("discard")}
                type="button"
              >
                Descartar rascunho
              </button>
            </div>
          </div>
        }
        basePath={`/criador-de-sites/templates/${templateId}`}
        exitHref="/criador-de-sites/novo"
        initialSite={initialSite}
        onResolveChannel={async input => {
          try {
            const result = await resolveYoutubeChannel(input);
            if (!result.ok) throw new Error(result.error);
            return { id: result.id, name: result.name };
          } catch (error) {
            throw new Error(friendlyError(error));
          }
        }}
        onSave={async site => {
          try {
            const result = await saveTemplateDraft(templateId, site);
            if (result.ok) setHasDraft(true);
            return result;
          } catch (error) {
            return { error: friendlyError(error), ok: false };
          }
        }}
        onUploadFont={async file => {
          try {
            const data = new FormData();
            data.append("file", file);
            const result = await uploadSiteFont(data);
            if (!result.ok) throw new Error(result.error);
            return { name: result.name, url: result.url };
          } catch (error) {
            throw new Error(friendlyError(error));
          }
        }}
        onUploadImage={uploadSiteMedia}
        originalSite={originalSite}
        storageKey={`template:${templateId}`}
      />

      {/* Aviso de entrada: aparece toda vez e não fecha sem uma escolha. */}
      <AlertDialog onOpenChange={() => undefined} open={!entered}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {"</>"} Você está entrando no modo Dev
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p>
                  Você vai editar o template <b>“{templateName}”</b>, que é uma{" "}
                  <b>demonstração</b> mostrada aos clientes na galeria.
                </p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>
                    O que você mexer fica em <b>rascunho</b>: só quem edita
                    templates vê.
                  </li>
                  <li>
                    Para valer para os clientes, clique em{" "}
                    <b>Publicar no template</b>. A partir daí, quem clicar em{" "}
                    <i>Usar este template</i> recebe esta versão para
                    customizar.
                  </li>
                  <li>Sites que os clientes já criaram não mudam.</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => router.push("/criador-de-sites/novo")}
            >
              Voltar à galeria
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => setEntered(true)}>
              Entendi, entrar no modo Dev
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        onOpenChange={open => !open && setConfirm(null)}
        open={confirm !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm === "publish"
                ? "Publicar no template?"
                : "Descartar o rascunho?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === "publish"
                ? "A versão que você está editando passa a ser a do template: todo cliente que clicar em Usar este template recebe esta versão para customizar. Sites já criados não mudam."
                : "As alterações do rascunho serão perdidas e o editor volta à versão publicada (ou ao template original, se nunca foi publicado)."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={confirm === "publish" ? publish : discard}
            >
              {confirm === "publish" ? "Publicar" : "Descartar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
