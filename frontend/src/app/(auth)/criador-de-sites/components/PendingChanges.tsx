import { ClipboardCheck } from "lucide-react";
import Link from "next/link";

export interface PendingItem {
  id: string;
  requesterEmail: string;
  requesterName: string;
  siteName: string;
  updatedAt: string;
}

/**
 * Alterações que admins enviaram para validação (nos sites do usuário, ou — para o Lucas — as que dependem dele).
 * Chama a atenção de propósito: quem valida precisa ver o que mudou e decidir.
 */
export default function PendingChanges({ items }: { items: PendingItem[] }) {
  return (
    <div className="flex flex-col gap-2.5 rounded-[14px] border border-[color:var(--sbx-warn-line)] bg-[color:var(--sbx-warn-bg)] p-4 shadow-[0_0_0_3px_rgba(245,158,11,0.15)]">
      <div className="flex items-center gap-2 font-medium text-[color:var(--sbx-warn-fg)] text-sm">
        <ClipboardCheck className="size-[16px]" />
        {items.length === 1
          ? "1 alteração esperando a sua validação"
          : `${items.length} alterações esperando a sua validação`}
      </div>
      {items.map(item => (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] bg-[color:var(--sbx-card)] px-3.5 py-2.5 text-sm"
          key={item.id}
        >
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate font-medium">{item.siteName}</span>
            <span className="truncate text-[color:var(--sbx-mute)] text-xs">
              {item.requesterName} ({item.requesterEmail}) ·{" "}
              {new Date(item.updatedAt).toLocaleString("pt-BR")}
            </span>
          </div>
          <Link
            className="flex shrink-0 items-center gap-1 rounded-full bg-[#d6f34a] px-4 py-1.5 font-medium text-[#1d1c1a] text-[12px]"
            href={`/criador-de-sites/aprovacoes/${item.id}`}
          >
            Ver o que mudou
          </Link>
        </div>
      ))}
    </div>
  );
}
