import { beforeEach, expect, mock, test } from "bun:test";

// biome-ignore lint/suspicious/noExplicitAny: fixtures do teste
let invoice: any;
// biome-ignore lint/suspicious/noExplicitAny: fixtures do teste
let job: any;
// biome-ignore lint/suspicious/noExplicitAny: fixtures do teste
let hostingUpserts: any[];
// biome-ignore lint/suspicious/noExplicitAny: fixtures do teste
let jobUpdates: any[];
// biome-ignore lint/suspicious/noExplicitAny: fixtures do teste
let publishCalls: any[];
let publishResult: { domain: string; ok: true } | { error: string; ok: false };
let renewalCalls: string[];

const siteHosting = {
  domain: "meusite.com.br",
  hostingAmountBrl: 29.9,
  kind: "domain" as const,
  siteId: "site-1",
  target: "atlas_vm" as const,
};

mock.module("@/lib/db", () => ({
  db: {
    insert: () => ({
      // biome-ignore lint/suspicious/noExplicitAny: fixtures do teste
      values: (value: any) => ({
        catch: () => Promise.resolve(),
        // biome-ignore lint/suspicious/noExplicitAny: fixtures do teste
        onConflictDoUpdate: async (_args: any) => {
          hostingUpserts.push(value);
        },
        then: (resolve: (value: unknown) => unknown) =>
          Promise.resolve(undefined).then(resolve),
      }),
    }),
    query: {
      pgInvoice: { findFirst: async () => invoice },
    },
    update: () => ({
      // biome-ignore lint/suspicious/noExplicitAny: fixtures do teste
      set: (value: any) => ({
        where: () => ({
          returning: async () => {
            // Só a primeira chamada encontra o job em `pending`: é a reserva.
            if (value.status === "running") {
              if (job.status !== "pending") return [];
              job.status = "running";
              jobUpdates.push(value);
              return [
                {
                  ...job,
                  id: "job-1",
                  payload: job.payload,
                  siteId: job.siteId,
                },
              ];
            }
            jobUpdates.push(value);
            return [];
          },
          then: (resolve: (value: unknown) => unknown) => {
            jobUpdates.push(value);
            return Promise.resolve([]).then(resolve);
          },
        }),
      }),
    }),
  },
}));

mock.module("./runPublish", () => ({
  // biome-ignore lint/suspicious/noExplicitAny: fixtures do teste
  runPublish: async (user: any, input: any, options: any) => {
    publishCalls.push({ input, options, user });
    return publishResult;
  },
}));

mock.module("@/lib/server/site-hosting/renewal", () => ({
  applySiteHostingRenewal: async (paid: { id: string }) => {
    renewalCalls.push(paid.id);
    return { ok: true };
  },
}));

const { fulfillSitePublishInvoice } = await import("./fulfillPublish");

beforeEach(() => {
  invoice = {
    id: "inv-1",
    metadata: { siteHosting },
    orgId: "org-1",
    status: "paid",
    userId: "user-1",
  };
  job = {
    payload: {
      domain: siteHosting.domain,
      hostingAmountBrl: siteHosting.hostingAmountBrl,
      kind: "domain",
      target: "atlas_vm",
    },
    siteId: "site-1",
    status: "pending",
  };
  hostingUpserts = [];
  jobUpdates = [];
  publishCalls = [];
  publishResult = { domain: siteHosting.domain, ok: true };
  renewalCalls = [];
});

test("publica uma vez só, mesmo chamando duas vezes para a mesma fatura", async () => {
  const first = await fulfillSitePublishInvoice("inv-1");
  const second = await fulfillSitePublishInvoice("inv-1");

  expect(first.ok).toBe(true);
  expect(second.ok).toBe(true);
  expect(publishCalls).toHaveLength(1);
  expect(hostingUpserts).toHaveLength(1);
  expect(hostingUpserts[0]).toMatchObject({
    amountBrl: 29.9,
    siteId: "site-1",
    status: "active",
  });
  expect(jobUpdates).toContainEqual(
    expect.objectContaining({ status: "done" })
  );
});

test("não publica enquanto a fatura não está paga", async () => {
  invoice.status = "pending";
  const result = await fulfillSitePublishInvoice("inv-1");
  expect(result.ok).toBe(false);
  expect(publishCalls).toHaveLength(0);
});

test("ignora fatura que não é de publicação de site", async () => {
  invoice.metadata = { vpsId: "6" };
  const result = await fulfillSitePublishInvoice("inv-1");
  expect(result.ok).toBe(true);
  expect(publishCalls).toHaveLength(0);
});

test("falha de deploy marca o job e não deixa a entrega como concluída", async () => {
  publishResult = {
    error: "Falha ao publicar: sem acesso ao servidor",
    ok: false,
  };
  const result = await fulfillSitePublishInvoice("inv-1");

  expect(result.ok).toBe(false);
  expect(jobUpdates).toContainEqual(
    expect.objectContaining({ status: "failed" })
  );
  expect(jobUpdates).not.toContainEqual(
    expect.objectContaining({ status: "done" })
  );
});

test("fatura de renovação da hospedagem vai para o fluxo de renovação", async () => {
  invoice.metadata = {
    isRenewal: true,
    renewalCycle: "2026-12-01T00:00:00.000Z",
    siteHostingSubscriptionId: "sub-1",
  };
  const result = await fulfillSitePublishInvoice("inv-1");

  expect(result.ok).toBe(true);
  expect(renewalCalls).toEqual(["inv-1"]);
  expect(publishCalls).toHaveLength(0);
});

test("publica na VPS do cliente sem criar assinatura de hospedagem", async () => {
  job.payload = {
    domain: siteHosting.domain,
    kind: "domain",
    target: "user_vps",
    vpsNodeId: "node-1",
  };
  const result = await fulfillSitePublishInvoice("inv-1");

  expect(result.ok).toBe(true);
  expect(hostingUpserts).toHaveLength(0);
  expect(publishCalls[0].input).toMatchObject({
    target: "user_vps",
    vpsNodeId: "node-1",
  });
  // A senha SSH nunca é gravada: o deploy pago usa a chave do Atlas.
  expect(publishCalls[0].input.password).toBeUndefined();
});
