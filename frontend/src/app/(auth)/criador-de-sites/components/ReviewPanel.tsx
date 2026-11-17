"use client";

import { Check, Loader, MessageSquare, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { reviewSiteChange } from "../approval-actions";

export interface ReviewComment {
  authorName: string;
  body: string;
  createdAt: string;
  id: string;
  kind: "approved" | "changes_requested" | "comment" | "submitted";
}

const KIND: Record<ReviewComment["kind"], string> = {
  approved: "aprovou",
  changes_requested: "pediu ajustes",
  comment: "comentou",
  submitted: "enviou para validação",
};

/** Conversa da revisão e os botões de decisão (aprovar, pedir ajustes, comentar), como num PR. */
export default function ReviewPanel({
  canDecide,
  comments,
  requestId,
  role,
}: {
  canDecide: boolean;
  comments: ReviewComment[];
  requestId: string;
  role: "requester" | "reviewer";
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const act = async (action: "approve" | "comment" | "request_changes") => {
    if (busy) return;
    setBusy(action);
    const result = await reviewSiteChange(requestId, action, body);
    setBusy(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(
      action === "approve"
        ? "Alterações aprovadas: o site já foi atualizado."
        : action === "request_changes"
          ? "Pedido de ajustes enviado."
          : "Comentário enviado."
    );
    setBody("");
    router.refresh();
  };

  const button =
    "flex items-center gap-1.5 rounded-full px-[18px] py-2.5 text-sm disabled:opacity-60";

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-medium text-base">Conversa</h2>
      {comments.length === 0 ? (
        <p className="text-[color:var(--sbx-mute)] text-sm">
          Ainda não há comentários.
        </p>
      ) : (
        comments.map(c => (
          <div
            className="flex flex-col gap-1 rounded-[14px] border border-[color:var(--sbx-line)] bg-[color:var(--sbx-card)] p-4 text-sm"
            key={c.id}
          >
            <div className="text-[color:var(--sbx-mute)] text-xs">
              <strong className="text-[color:var(--sbx-ink)]">
                {c.authorName}
              </strong>{" "}
              {KIND[c.kind]} · {new Date(c.createdAt).toLocaleString("pt-BR")}
            </div>
            {c.body ? <p className="whitespace-pre-wrap">{c.body}</p> : null}
          </div>
        ))
      )}

      <textarea
        className="min-h-[90px] w-full rounded-[10px] border border-[color:var(--sbx-line)] bg-[color:var(--sbx-card)] p-3 text-sm outline-none placeholder:text-[color:var(--sbx-faint)]"
        maxLength={4000}
        onChange={e => setBody(e.target.value)}
        placeholder={
          canDecide
            ? "Comentário (obrigatório para pedir ajustes)…"
            : "Escreva um comentário…"
        }
        value={body}
      />
      <div className="flex flex-wrap gap-2">
        {canDecide ? (
          <>
            <button
              className={`${button} bg-[#d6f34a] font-medium text-[#1d1c1a]`}
              disabled={busy !== null}
              onClick={() => void act("approve")}
              type="button"
            >
              {busy === "approve" ? (
                <Loader className="size-[15px] animate-spin" />
              ) : (
                <Check className="size-[15px]" />
              )}
              Aprovar e aplicar no site
            </button>
            <button
              className={`${button} border border-[color:var(--sbx-warn-line)] bg-[color:var(--sbx-warn-bg)] text-[color:var(--sbx-warn-fg)]`}
              disabled={busy !== null || !body.trim()}
              onClick={() => void act("request_changes")}
              type="button"
            >
              {busy === "request_changes" ? (
                <Loader className="size-[15px] animate-spin" />
              ) : (
                <RotateCcw className="size-[15px]" />
              )}
              Pedir ajustes
            </button>
          </>
        ) : null}
        <button
          className={`${button} border border-[color:var(--sbx-line)] bg-[color:var(--sbx-card)]`}
          disabled={busy !== null || !body.trim()}
          onClick={() => void act("comment")}
          type="button"
        >
          {busy === "comment" ? (
            <Loader className="size-[15px] animate-spin" />
          ) : (
            <MessageSquare className="size-[15px]" />
          )}
          Só comentar
        </button>
      </div>
      {role === "requester" ? (
        <p className="text-[color:var(--sbx-mute)] text-xs">
          Você é o autor da alteração: quem valida decide. Depois dos ajustes,
          volte ao editor e envie de novo.
        </p>
      ) : null}
    </section>
  );
}
