import { expect, test } from "bun:test";
import {
  applyAnyMinPrice,
  atlasFee,
  blocksOthers,
  buyerTotal,
  cycleEnd,
  dueReminder,
  minimumOffer,
  normalizeResaleConfig,
  proposalActionError,
  renewalInvoiceDue,
  templateStateFor,
  validateAskingPrice,
  validateOfferAmount,
  walletAvailable,
} from "./rules";

const DAY = 24 * 60 * 60 * 1000;

test("mínimo: usa o valor do dono, nunca abaixo do piso", () => {
  expect(minimumOffer(null, 100)).toBe(100);
  expect(minimumOffer(2200, 100)).toBe(2200);
  // O piso subiu depois que o dono definiu o mínimo: vale o piso.
  expect(minimumOffer(150, 200)).toBe(200);
});

test("taxa por cima: comprador paga valor fechado + taxa", () => {
  expect(atlasFee(2200, 10)).toBe(220);
  expect(buyerTotal(2200, 10)).toBe(2420);
  expect(buyerTotal(2500, 10)).toBe(2750);
  expect(buyerTotal(1234.56, 7.5)).toBe(1327.15);
  expect(buyerTotal(100, 0)).toBe(100);
});

test("config do admin inválida cai no padrão", () => {
  expect(normalizeResaleConfig({})).toEqual({
    feePercent: 10,
    minPriceBrl: 100,
  });
  expect(normalizeResaleConfig({ feePercent: -1, minPriceBrl: 0 })).toEqual({
    feePercent: 10,
    minPriceBrl: 100,
  });
  expect(normalizeResaleConfig({ feePercent: 12.5, minPriceBrl: 250 })).toEqual(
    {
      feePercent: 12.5,
      minPriceBrl: 250,
    }
  );
});

test("valor mínimo do dono respeita o piso", () => {
  expect(validateAskingPrice(50, 100)).toContain("não pode ser menor");
  expect(validateAskingPrice(100, 100)).toBeNull();
  expect(validateAskingPrice(Number.NaN, 100)).toBe("Informe um valor válido.");
});

test("lance abaixo do mínimo é recusado", () => {
  expect(validateOfferAmount(2100, 2200)).toContain("mínimo");
  expect(validateOfferAmount(2200, 2200)).toBeNull();
  expect(validateOfferAmount(0, 100)).toBe("Informe um valor válido.");
});

test("só quem está com a vez responde", () => {
  const now = new Date("2026-01-01T00:00:00Z");
  const open = {
    expiresAt: new Date(now.getTime() + DAY),
    status: "open",
    turn: "seller" as const,
  };
  expect(proposalActionError(open, "seller", "accept", now)).toBeNull();
  expect(proposalActionError(open, "seller", "counter", now)).toBeNull();
  expect(proposalActionError(open, "buyer", "accept", now)).toContain(
    "Aguarde"
  );
  // Cancelar é do comprador, mesmo fora da vez dele.
  expect(proposalActionError(open, "buyer", "cancel", now)).toBeNull();
  expect(proposalActionError(open, "seller", "cancel", now)).toContain(
    "Só quem"
  );
});

test("proposta encerrada ou expirada não aceita ação", () => {
  const now = new Date("2026-01-01T00:00:00Z");
  const expired = {
    expiresAt: new Date(now.getTime() - 1),
    status: "open",
    turn: "seller" as const,
  };
  expect(proposalActionError(expired, "seller", "accept", now)).toContain(
    "expirou"
  );
  const awaiting = { ...expired, status: "awaiting_payment" };
  expect(proposalActionError(awaiting, "seller", "accept", now)).toContain(
    "encerrada"
  );
  expect(proposalActionError(awaiting, "buyer", "cancel", now)).toBeNull();
  const paid = { ...expired, status: "paid" };
  expect(proposalActionError(paid, "buyer", "cancel", now)).toContain(
    "encerrada"
  );
});

test("ciclo de 12 meses e fatura de renovação 15 dias antes", () => {
  const start = new Date("2026-03-10T12:00:00Z");
  expect(cycleEnd(start).toISOString()).toBe("2027-03-10T12:00:00.000Z");
  const expires = new Date("2027-03-10T12:00:00Z");
  expect(
    renewalInvoiceDue(expires, new Date(expires.getTime() - 20 * DAY))
  ).toBe(false);
  expect(
    renewalInvoiceDue(expires, new Date(expires.getTime() - 15 * DAY))
  ).toBe(true);
});

test("lembretes: um por marco, sem repetir", () => {
  const expires = new Date("2027-03-10T12:00:00Z");
  const cycle = expires.toISOString();
  expect(
    dueReminder(expires, [], new Date(expires.getTime() - 30 * DAY))
  ).toBeNull();

  const at15 = dueReminder(expires, [], new Date(expires.getTime() - 14 * DAY));
  expect(at15).toEqual({ days: 15, key: `${cycle}:15` });
  expect(
    dueReminder(
      expires,
      [`${cycle}:15`],
      new Date(expires.getTime() - 14 * DAY)
    )
  ).toBeNull();

  // Pulou direto para a véspera (job parado): manda só o de 1 dia.
  const at1 = dueReminder(expires, [], new Date(expires.getTime() - DAY / 2));
  expect(at1?.days).toBe(1);
  expect(
    dueReminder(expires, [], new Date(expires.getTime() + DAY))
  ).toBeNull();
});

test("saldo da carteira soma comissões e vendas e desconta saques", () => {
  expect(
    walletAvailable({
      commissions: 150,
      entries: 2500,
      pendingWithdrawals: 100,
      withdrawals: 300,
    })
  ).toBe(2350);
  expect(
    walletAvailable({
      commissions: 0,
      entries: 0,
      pendingWithdrawals: 0,
      withdrawals: 50,
    })
  ).toBe(0);
});

test("estado do template para quem vê a galeria", () => {
  const setting = { annualPriceBrl: 2000, enabled: true };
  expect(templateStateFor({ floor: 100, viewerId: "a" })).toEqual({
    kind: "public",
  });
  expect(templateStateFor({ floor: 100, setting, viewerId: "a" })).toEqual({
    annualPriceBrl: 2000,
    kind: "available",
  });

  const exclusivity = {
    expiresAt: new Date("2027-01-01"),
    id: "ex-1",
    minAskingPriceBrl: 2200,
    ownerUserId: "dono",
    status: "active",
  };
  const mine = templateStateFor({
    exclusivity,
    floor: 100,
    setting,
    viewerId: "dono",
  });
  expect(mine.kind).toBe("owned_by_me");
  expect(blocksOthers(mine)).toBe(false);

  const other = templateStateFor({
    exclusivity,
    floor: 100,
    setting,
    viewerId: "b",
  });
  expect(other).toEqual({
    exclusivityId: "ex-1",
    kind: "owned_by_other",
    minOfferBrl: 2200,
  });
  expect(blocksOthers(other)).toBe(true);

  const reserved = templateStateFor({
    exclusivity: { ...exclusivity, status: "reserved" },
    floor: 100,
    setting,
    viewerId: "b",
  });
  expect(reserved.kind).toBe("reserved");
  expect(blocksOthers(reserved)).toBe(true);

  // Exclusividade expirada: volta a valer a config do admin.
  expect(
    templateStateFor({
      exclusivity: { ...exclusivity, status: "expired" },
      floor: 100,
      setting,
      viewerId: "b",
    }).kind
  ).toBe("available");
});

test("reserva de checkout vencida não prende o template (mesmo que o job de limpeza não tenha rodado)", () => {
  const setting = { annualPriceBrl: 4000, enabled: true };
  const now = new Date("2026-11-19T12:00:00Z");
  const reserva = (reservedUntil: Date | null) => ({
    expiresAt: null,
    id: "ex-1",
    minAskingPriceBrl: null,
    ownerUserId: "outra-pessoa",
    reservedUntil,
    status: "reserved",
  });
  const ver = (reservedUntil: Date | null, viewerId = "eu") =>
    templateStateFor({
      exclusivity: reserva(reservedUntil),
      floor: 100,
      now,
      setting,
      viewerId,
    });
  // ainda dentro do prazo: continua reservada para os outros
  expect(ver(new Date("2026-11-19T20:00:00Z")).kind).toBe("reserved");
  // vencida: volta a estar à venda
  expect(ver(new Date("2026-11-17T20:48:43Z"))).toEqual({
    annualPriceBrl: 4000,
    kind: "available",
  });
  // sem prazo gravado, na dúvida continua reservada
  expect(ver(null).kind).toBe("reserved");
  // vencida e sem preço configurado: template público
  expect(
    templateStateFor({
      exclusivity: reserva(new Date("2026-11-17T20:48:43Z")),
      floor: 100,
      now,
      viewerId: "eu",
    })
  ).toEqual({ kind: "public" });
});

test("modo de teste: qualquer valor mínimo, taxa do Atlas mantida", () => {
  const stored = { feePercent: 10, minPriceBrl: 100 };
  expect(applyAnyMinPrice(stored, false)).toEqual(stored);
  const config = applyAnyMinPrice(stored, true);
  expect(config).toEqual({ feePercent: 10, minPriceBrl: 0.01 });
  expect(validateAskingPrice(1, config.minPriceBrl)).toBeNull();
  expect(validateAskingPrice(2, config.minPriceBrl)).toBeNull();
  expect(minimumOffer(null, config.minPriceBrl)).toBe(0.01);
  expect(minimumOffer(1, config.minPriceBrl)).toBe(1);
  expect(
    validateOfferAmount(0.5, minimumOffer(1, config.minPriceBrl))
  ).toContain("mínimo");
  expect(buyerTotal(1, config.feePercent)).toBe(1.1);
  expect(buyerTotal(2, config.feePercent)).toBe(2.2);
});
