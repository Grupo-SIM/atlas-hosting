import { ChevronRight, X } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Steps } from "./Steps";

interface Props {
  children: ReactNode;
  /** Migalhas do topo; a última é a tela atual. */
  crumbs: { href?: string; label: string }[];
  /** Mostra o X de sair para este endereço. */
  closeHref?: string;
  icon?: ReactNode;
  step?: 1 | 2 | 3;
}

/** Cartão das telas do Criador de Sites: barra de 52px com migalhas, passos e fechar. */
export function Frame({ children, closeHref, crumbs, icon, step }: Props) {
  return (
    <div className="flex min-h-full flex-col bg-[color:var(--sbx-bg)] text-[color:var(--sbx-ink)]">
      <div className="flex h-[52px] shrink-0 items-center gap-2 border-[color:var(--sbx-line-soft)] border-b px-[18px] text-[13px] text-[color:var(--sbx-mute)]">
        {icon}
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <span className="flex items-center gap-2" key={c.label}>
              {c.href && !last ? (
                <Link
                  className="hover:text-[color:var(--sbx-ink)]"
                  href={c.href}
                >
                  {c.label}
                </Link>
              ) : (
                <span
                  className={
                    last ? "font-medium text-[color:var(--sbx-ink)]" : ""
                  }
                >
                  {c.label}
                </span>
              )}
              {last ? null : <ChevronRight className="size-[13px]" />}
            </span>
          );
        })}
        <div className="flex-1" />
        {step ? <Steps current={step} /> : null}
        <div className="flex-1" />
        {closeHref ? (
          <Link aria-label="Fechar" href={closeHref}>
            <X className="size-4 text-[color:var(--sbx-ink)]" />
          </Link>
        ) : null}
      </div>
      {children}
    </div>
  );
}
