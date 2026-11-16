import type { TemplateProposalStatus } from "@/lib/db/schema";

export const PROPOSAL_STATUS_LABEL: Record<TemplateProposalStatus, string> = {
  awaiting_payment: "Aguardando pagamento",
  cancelled: "Cancelada",
  declined: "Recusada",
  expired: "Expirada",
  open: "Em negociação",
  paid: "Concluída",
};

export const EVENT_LABEL: Record<string, string> = {
  accept: "aceitou",
  cancel: "cancelou",
  counter: "mandou uma contraproposta de",
  decline: "recusou",
  expire: "expirou",
  offer: "ofereceu",
  paid: "pagamento confirmado",
};
