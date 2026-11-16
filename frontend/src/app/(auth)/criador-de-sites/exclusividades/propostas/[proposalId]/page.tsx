import { format } from "date-fns";
import { asc, eq } from "drizzle-orm";
import { Crown } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  pgTemplateExclusivity,
  pgTemplateProposal,
  pgTemplateProposalEvent,
} from "@/lib/db/schema";
import { requireBuilderUser } from "@/lib/site-builder/access";
import {
  atlasFee,
  buyerTotal,
  formatBrl,
  minimumOffer,
} from "@/lib/template-exclusivity/rules";
import { templateName } from "@/lib/template-exclusivity/names";
import { getResaleConfig } from "@/lib/template-exclusivity/status";
import { Frame } from "../../../components/Frame";
import { ProposalActions } from "../../components/ProposalActions";
import { EVENT_LABEL, PROPOSAL_STATUS_LABEL } from "../../labels";

export const metadata: Metadata = {
  title: "Negociação de template - Atlas Hosting",
};

export default async function ProposalPage({
  params,
}: {
  params: Promise<{ proposalId: string }>;
}) {
  const user = await requireBuilderUser();
  const { proposalId } = await params;

  const [proposal] = await db
    .select()
    .from(pgTemplateProposal)
    .where(eq(pgTemplateProposal.id, proposalId))
    .limit(1);
  if (!proposal) notFound();
  const role =
    proposal.buyerUserId === user.id
      ? "buyer"
      : proposal.sellerUserId === user.id
        ? "seller"
        : null;
  if (!role) notFound();

  const [events, [exclusivity], resale] = await Promise.all([
    db
      .select()
      .from(pgTemplateProposalEvent)
      .where(eq(pgTemplateProposalEvent.proposalId, proposal.id))
      .orderBy(asc(pgTemplateProposalEvent.createdAt)),
    db
      .select({ minAskingPriceBrl: pgTemplateExclusivity.minAskingPriceBrl })
      .from(pgTemplateExclusivity)
      .where(eq(pgTemplateExclusivity.id, proposal.exclusivityId))
      .limit(1),
    getResaleConfig(),
  ]);

  const feePercent = proposal.feePercent ?? resale.feePercent;
  const minimum = minimumOffer(exclusivity?.minAskingPriceBrl, resale.minPriceBrl);
  const name = templateName(proposal.templateId);
  const who = (actor: string) =>
    actor === "system"
      ? "Sistema"
      : actor === role
        ? "Você"
        : actor === "buyer"
          ? "Comprador"
          : "Dono atual";

  return (
    <Frame
      closeHref="/criador-de-sites/exclusividades"
      crumbs={[
        { href: "/criador-de-sites", label: "Sites" },
        { href: "/criador-de-sites/exclusividades", label: "Exclusividades" },
        { label: name },
      ]}
      icon={<Crown className="size-[15px]" />}
    >
      <div className="flex-1 overflow-auto px-5 pt-9 pb-20 md:px-10">
        <div className="mx-auto flex max-w-2xl flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <h1 className="font-medium text-[28px] tracking-[-0.02em]">
              {role === "buyer" ? "Sua proposta" : "Proposta recebida"} · {name}
            </h1>
            <p className="text-[#6e6b65] text-sm">
              {role === "buyer"
                ? "Você está negociando com o dono atual do template."
                : "Um usuário quer comprar a exclusividade deste template."}{" "}
              <Link
                className="underline"
                href={`/criador-de-sites/preview/${proposal.templateId}`}
              >
                Ver template
              </Link>
            </p>
          </div>

          <div className="grid gap-3 rounded-[14px] border border-[#e5e2db] bg-white p-5 sm:grid-cols-3">
            <Info label="Valor na mesa" value={formatBrl(proposal.amountBrl)} />
            <Info
              label={role === "buyer" ? "Você paga" : "Comprador paga"}
              value={formatBrl(buyerTotal(proposal.amountBrl, feePercent))}
            />
            <Info
              label={role === "seller" ? "Você recebe" : "Dono recebe"}
              value={formatBrl(proposal.amountBrl)}
            />
            <p className="text-[#6e6b65] text-[12px] sm:col-span-3">
              Taxa do Atlas: {feePercent}% ({formatBrl(atlasFee(proposal.amountBrl, feePercent))}),
              cobrada do comprador. Status:{" "}
              <strong>{PROPOSAL_STATUS_LABEL[proposal.status]}</strong>
              {proposal.status === "open" &&
                ` · responder até ${format(proposal.expiresAt, "dd/MM/yyyy HH:mm")}`}
              {proposal.status === "awaiting_payment" &&
                proposal.paymentDeadline &&
                ` · pagamento até ${format(proposal.paymentDeadline, "dd/MM/yyyy HH:mm")}`}
            </p>
          </div>

          <ProposalActions
            checkoutUrl={proposal.invoiceId ? `/checkout/${proposal.invoiceId}` : null}
            feePercent={feePercent}
            minimum={minimum}
            proposal={{
              amountBrl: proposal.amountBrl,
              expiresAt: proposal.expiresAt,
              id: proposal.id,
              status: proposal.status,
              turn: proposal.turn,
            }}
            role={role}
          />

          <section className="flex flex-col gap-3">
            <h2 className="font-medium text-lg">Histórico</h2>
            <ol className="flex flex-col gap-2">
              {events.map(event => (
                <li
                  className="flex items-start justify-between gap-4 rounded-[10px] border border-[#ece9e2] bg-white px-4 py-3 text-sm"
                  key={event.id}
                >
                  <span>
                    <strong>{who(event.actor)}</strong>{" "}
                    {EVENT_LABEL[event.action] ?? event.action}
                    {event.amountBrl &&
                    (event.action === "offer" || event.action === "counter")
                      ? ` ${formatBrl(event.amountBrl)}`
                      : ""}
                    {event.note ? ` — ${event.note}` : ""}
                  </span>
                  <span className="shrink-0 text-[#6e6b65] text-[12px]">
                    {format(event.createdAt, "dd/MM HH:mm")}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </Frame>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[#6e6b65] text-[12px]">{label}</span>
      <span className="font-medium text-lg">{value}</span>
    </div>
  );
}
