"use client";

import { Loader, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { submitChangeForReview } from "../../approval-actions";

export type ReviewState = "changes_requested" | "draft" | "none" | "pending";

/**
 * Faixa do editor de um admin que edita site de cliente com validação: mostra em que pé está (rascunho, enviada,
 * ajustes pedidos) e deixa enviar para validação, com uma mensagem opcional.
 */
export default function ReviewBanner({
  mode,
  requestId,
  siteId,
  state,
}: {
  mode: "master" | "owner";
  requestId: string | null;
  siteId: string;
  state: ReviewState;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const reviewer = mode === "owner" ? "o dono do site" : "o Lucas";
  // "de" + "o" = "do" ("validação do Lucas", não "de o Lucas").
  const ofReviewer = `d${reviewer}`;

  const send = async () => {
    if (busy) return;
    setBusy(true);
    const result = await submitChangeForReview(siteId, message);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Enviado para validação.");
    setMessage("");
    router.refresh();
  };

  const canSend = state === "draft" || state === "changes_requested";

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span>
        <strong>Site de cliente.</strong>{" "}
        {state === "pending"
          ? `Suas alterações foram enviadas e aguardam ${reviewer}. Você pode continuar editando: ele vê a versão mais recente.`
          : state === "changes_requested"
            ? `${reviewer[0]?.toUpperCase()}${reviewer.slice(1)} pediu ajustes. Veja o comentário, corrija e envie de novo.`
            : state === "draft"
              ? `Suas alterações ainda não valem: envie para validação ${ofReviewer}.`
              : `Suas alterações não mudam o site: precisam da validação ${ofReviewer}. Publicar fica para depois de aprovadas.`}
      </span>
      {requestId ? (
        <Link
          className="sbe-btn"
          href={`/criador-de-sites/aprovacoes/${requestId}`}
          target="_blank"
        >
          Ver o que mudou e os comentários
        </Link>
      ) : null}
      {canSend ? (
        <>
          <input
            maxLength={500}
            onChange={e => setMessage(e.target.value)}
            placeholder="Mensagem para quem valida (opcional)"
            style={{
              border: "1px solid #e0ddd5",
              borderRadius: 8,
              fontSize: 12,
              minWidth: 220,
              padding: "6px 9px",
            }}
            value={message}
          />
          <button
            className="sbe-btn"
            disabled={busy}
            onClick={() => void send()}
            type="button"
          >
            {busy ? (
              <Loader className="size-[13px] animate-spin" />
            ) : (
              <Send className="size-[13px]" />
            )}
            Enviar para validação
          </button>
        </>
      ) : null}
    </div>
  );
}
