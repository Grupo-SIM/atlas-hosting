import { format } from "date-fns";
import { and, desc, eq, inArray, or } from "drizzle-orm";
import { Crown } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { db } from "@/lib/db";
import {
  OWNED_EXCLUSIVITY_STATUSES,
  pgTemplateExclusivity,
  pgTemplateExclusivitySetting,
  pgTemplateProposal,
  type TemplateProposal,
} from "@/lib/db/schema";
import { requireBuilderUser } from "@/lib/site-builder/access";
import { formatBrl, minimumOffer } from "@/lib/template-exclusivity/rules";
import { templateName } from "@/lib/template-exclusivity/names";
import { getResaleConfig } from "@/lib/template-exclusivity/status";
import { Frame } from "../components/Frame";
import { MinPriceForm } from "./components/MinPriceForm";
import { PROPOSAL_STATUS_LABEL } from "./labels";

export const metadata: Metadata = {
  title: "Exclusividades - Atlas Hosting",
};

export default async function ExclusivitiesPage() {
  const user = await requireBuilderUser();
  const [owned, proposals, resale, settings] = await Promise.all([
    db
      .select()
      .from(pgTemplateExclusivity)
      .where(
        and(
          eq(pgTemplateExclusivity.ownerUserId, user.id),
          inArray(pgTemplateExclusivity.status, [...OWNED_EXCLUSIVITY_STATUSES])
        )
      )
      .orderBy(desc(pgTemplateExclusivity.createdAt)),
    db
      .select()
      .from(pgTemplateProposal)
      .where(
        or(
          eq(pgTemplateProposal.buyerUserId, user.id),
          eq(pgTemplateProposal.sellerUserId, user.id)
        )
      )
      .orderBy(desc(pgTemplateProposal.updatedAt))
      .limit(100),
    getResaleConfig(),
    db.select().from(pgTemplateExclusivitySetting),
  ]);

  const received = proposals.filter(item => item.sellerUserId === user.id);
  const sent = proposals.filter(item => item.buyerUserId === user.id);

  return (
    <Frame
      closeHref="/criador-de-sites"
      crumbs={[
        { href: "/criador-de-sites", label: "Sites" },
        { label: "Exclusividades" },
      ]}
      icon={<Crown className="size-[15px]" />}
    >
      <div className="flex-1 overflow-auto px-5 pt-9 pb-20 md:px-10">
        <div className="mx-auto flex max-w-4xl flex-col gap-10">
          <div className="flex flex-col gap-1.5">
            <h1 className="font-medium text-[28px] tracking-[-0.02em]">
              Exclusividades
            </h1>
            <p className="text-[#6e6b65] text-sm">
              Templates que são só seus e as negociações de compra e venda.
              Na venda, o comprador paga o valor fechado + a taxa do Atlas (
              {resale.feePercent}%) e você recebe o valor fechado na sua{" "}
              <Link className="underline" href="/carteira">
                carteira
              </Link>
              .
            </p>
          </div>

          <section className="flex flex-col gap-3">
            <h2 className="font-medium text-lg">Meus templates exclusivos</h2>
            {owned.length === 0 ? (
              <Empty>
                Você ainda não tem templates exclusivos.{" "}
                <Link className="underline" href="/criador-de-sites/novo">
                  Ver templates
                </Link>
              </Empty>
            ) : (
              owned.map(item => {
                const setting = settings.find(s => s.templateId === item.templateId);
                return (
                  <div
                    className="flex flex-col gap-4 rounded-[14px] border border-[#e5e2db] bg-white p-5 md:flex-row md:items-start md:justify-between"
                    key={item.id}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 font-medium">
                        {templateName(item.templateId)}
                        {item.status === "past_due" && (
                          <span className="rounded-full bg-[#fdecec] px-2 py-0.5 text-[#b42318] text-[11px]">
                            Em atraso
                          </span>
                        )}
                      </div>
                      <div className="text-[#6e6b65] text-[13px]">
                        {item.status === "past_due" && item.graceUntil
                          ? `Venceu. Pague até ${format(item.graceUntil, "dd/MM/yyyy")} para não perder a exclusividade.`
                          : item.expiresAt
                            ? `Vale até ${format(item.expiresAt, "dd/MM/yyyy")}. Renovação: ${formatBrl(setting?.annualPriceBrl ?? item.paidAmountBrl)}/ano.`
                            : null}
                      </div>
                      <div className="text-[#6e6b65] text-[13px]">
                        Propostas a partir de{" "}
                        <strong>
                          {formatBrl(
                            minimumOffer(item.minAskingPriceBrl, resale.minPriceBrl)
                          )}
                        </strong>
                      </div>
                      <Link
                        className="mt-1 text-[13px] underline"
                        href={`/criador-de-sites/preview/${item.templateId}`}
                      >
                        Criar site com este template
                      </Link>
                    </div>
                    <MinPriceForm
                      current={item.minAskingPriceBrl}
                      exclusivityId={item.id}
                      floor={resale.minPriceBrl}
                    />
                  </div>
                );
              })
            )}
          </section>

          <ProposalList
            empty="Nenhuma proposta recebida."
            items={received}
            role="seller"
            title="Propostas recebidas"
          />
          <ProposalList
            empty="Você ainda não fez propostas."
            items={sent}
            role="buyer"
            title="Propostas enviadas"
          />
        </div>
      </div>
    </Frame>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[14px] border border-[#d9d6ce] border-dashed p-6 text-center text-[#6e6b65] text-sm">
      {children}
    </div>
  );
}

function ProposalList({
  empty,
  items,
  role,
  title,
}: {
  empty: string;
  items: TemplateProposal[];
  role: "buyer" | "seller";
  title: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-medium text-lg">{title}</h2>
      {items.length === 0 ? (
        <Empty>{empty}</Empty>
      ) : (
        <ul className="flex flex-col divide-y divide-[#ece9e2] overflow-hidden rounded-[14px] border border-[#e5e2db] bg-white">
          {items.map(item => {
            const waitingMe =
              item.status === "open" && item.turn === role;
            const payNow = role === "buyer" && item.status === "awaiting_payment";
            return (
              <li key={item.id}>
                <Link
                  className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[#faf9f6]"
                  href={`/criador-de-sites/exclusividades/propostas/${item.id}`}
                >
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate font-medium text-sm">
                      {templateName(item.templateId)}
                    </span>
                    <span className="text-[#6e6b65] text-[12px]">
                      Atualizada em {format(item.updatedAt, "dd/MM/yyyy HH:mm")}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-medium text-sm">
                      {formatBrl(item.amountBrl)}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs ${
                        waitingMe || payNow
                          ? "bg-[#d6f34a] text-[#1d1c1a]"
                          : "bg-[#f3f1ec] text-[#55524c]"
                      }`}
                    >
                      {waitingMe
                        ? "Sua vez de responder"
                        : payNow
                          ? "Pagar agora"
                          : PROPOSAL_STATUS_LABEL[item.status]}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
