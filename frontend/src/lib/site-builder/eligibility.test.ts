import { beforeEach, expect, mock, test } from "bun:test";

/**
 * Linhas que o join entre `vps_nodes` e `vps_subscriptions` devolveria. O filtro
 * de verdade é SQL; aqui o teste cobre o contrato de `listPublishTargets` e de
 * `assertEligibleVpsNode` (preço da VM, nó não elegível, mensagem de erro).
 */
let rows: { id: string; ip: string; name: string }[];

mock.module("@/lib/db", () => ({
  db: {
    selectDistinct: () => ({
      from: () => ({
        leftJoin: () => ({
          where: async () => rows,
        }),
      }),
    }),
  },
}));

const { assertEligibleVpsNode, listPublishTargets } = await import(
  "./eligibility"
);

beforeEach(() => {
  rows = [{ id: "node-1", ip: "192.0.2.10", name: "Atlas vps 1" }];
  process.env.SITE_BUILDER_ATLAS_VM_HOST = "vps.exemplo.com";
  process.env.SITE_BUILDER_HOSTING_MONTHLY_BRL = "29,90";
  delete process.env.SITE_BUILDER_ATLAS_VM_IP;
});

test("lista as VPS elegíveis e o preço da hospedagem do Atlas", async () => {
  const targets = await listPublishTargets("user-1");
  expect(targets.vpsNodes).toEqual([
    { id: "node-1", ip: "192.0.2.10", name: "Atlas vps 1" },
  ]);
  expect(targets.atlasVm).toEqual({
    enabled: true,
    host: "vps.exemplo.com",
    monthlyBrl: 29.9,
  });
});

test("sem mensalidade configurada, a hospedagem do Atlas fica desligada", async () => {
  delete process.env.SITE_BUILDER_HOSTING_MONTHLY_BRL;
  const targets = await listPublishTargets("user-1");
  expect(targets.atlasVm.enabled).toBe(false);
  expect(targets.atlasVm.monthlyBrl).toBeNull();
});

test("mensalidade zerada ou inválida também desliga a opção paga", async () => {
  for (const value of ["0", "-5", "abc"]) {
    process.env.SITE_BUILDER_HOSTING_MONTHLY_BRL = value;
    const targets = await listPublishTargets("user-1");
    expect(targets.atlasVm.enabled).toBe(false);
  }
});

test("aceita só nó que apareceu na lista de elegíveis", async () => {
  const ok = await assertEligibleVpsNode("user-1", "node-1");
  expect(ok).toEqual({ id: "node-1", ip: "192.0.2.10", name: "Atlas vps 1" });

  const outro = await assertEligibleVpsNode("user-1", "node-9");
  expect(outro).toHaveProperty("error");
  expect("error" in outro && outro.error).toContain("assinatura em dia");
});

test("sem servidor escolhido, pede para escolher", async () => {
  const result = await assertEligibleVpsNode("user-1", undefined);
  expect(result).toEqual({ error: "Escolha em qual servidor publicar." });
});

test("VPS com assinatura cancelada não aparece (join não devolve a linha)", async () => {
  rows = [];
  const targets = await listPublishTargets("user-1");
  expect(targets.vpsNodes).toEqual([]);
  const result = await assertEligibleVpsNode("user-1", "node-1");
  expect(result).toHaveProperty("error");
});
