"use server";

import { getTemplate } from "@repo/site-builder";
import { and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getRealUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  OWNED_EXCLUSIVITY_STATUSES,
  pgTemplateExclusivity,
  pgTemplateExclusivitySetting,
} from "@/lib/db/schema";
import { hasAreaAccess } from "@/lib/permissions/access";
import { savePaymentSettings } from "@/lib/server/payment-settings";
import { round2 } from "@/lib/template-exclusivity/rules";

type Result = { ok: true } | { error: string; ok: false };

const PATH = "/admin/exclusividade";

async function assertAdmin(): Promise<boolean> {
  const user = await getRealUser();
  return hasAreaAccess(user, "admin_exclusivity", "edit");
}

export interface TemplateExclusivityInput {
  annualPriceBrl: number;
  enabled: boolean;
  templateId: string;
}

/**
 * Salva de uma vez as alterações da tabela de templates: liga/desliga a
 * exclusividade e define o preço anual. Tudo ou nada: se um template não
 * passar na validação, nenhum é gravado.
 */
export async function saveTemplateExclusivities(
  input: TemplateExclusivityInput[]
): Promise<Result> {
  if (!(await assertAdmin())) {
    return { error: "Acesso restrito a administradores.", ok: false };
  }
  if (!Array.isArray(input) || input.length === 0) {
    return { error: "Nenhuma alteração para salvar.", ok: false };
  }

  const items = new Map<string, { enabled: boolean; price: number }>();
  for (const raw of input) {
    const templateId = String(raw?.templateId ?? "");
    const template = getTemplate(templateId);
    if (!template) return { error: "Template não encontrado.", ok: false };
    const enabled = Boolean(raw.enabled);
    const price = round2(Number(raw.annualPriceBrl));
    const valid = Number.isFinite(price) && price > 0;
    if (enabled && !valid) {
      return {
        error: `Informe o preço anual de ${template.name}.`,
        ok: false,
      };
    }
    items.set(templateId, { enabled, price: valid ? price : 0 });
  }

  const disabling = [...items].filter(([, item]) => !item.enabled).map(([id]) => id);
  if (disabling.length > 0) {
    const owned = await db
      .select({ templateId: pgTemplateExclusivity.templateId })
      .from(pgTemplateExclusivity)
      .where(
        and(
          inArray(pgTemplateExclusivity.templateId, disabling),
          inArray(pgTemplateExclusivity.status, [
            ...OWNED_EXCLUSIVITY_STATUSES,
            "reserved",
          ])
        )
      )
      .limit(1);
    if (owned[0]) {
      const name = getTemplate(owned[0].templateId)?.name ?? owned[0].templateId;
      return {
        error: `${name} tem dono (ou uma compra em andamento): a exclusividade não pode ser desligada agora.`,
        ok: false,
      };
    }
  }

  const now = new Date();
  await db.transaction(async tx => {
    for (const [templateId, item] of items) {
      await tx
        .insert(pgTemplateExclusivitySetting)
        .values({ annualPriceBrl: item.price, enabled: item.enabled, templateId })
        .onConflictDoUpdate({
          set: { annualPriceBrl: item.price, enabled: item.enabled, updatedAt: now },
          target: pgTemplateExclusivitySetting.templateId,
        });
    }
  });

  revalidatePath(PATH);
  revalidatePath("/criador-de-sites/novo");
  return { ok: true };
}

/** Taxa do Atlas na revenda (%) e menor valor mínimo de venda permitido. */
export async function saveResaleSettings(input: {
  feePercent: number;
  minPriceBrl: number;
}): Promise<Result> {
  if (!(await assertAdmin())) {
    return { error: "Acesso restrito a administradores.", ok: false };
  }
  const fee = Number(input.feePercent);
  const min = round2(Number(input.minPriceBrl));
  if (!(Number.isFinite(fee) && fee >= 0 && fee <= 100)) {
    return { error: "A taxa precisa estar entre 0% e 100%.", ok: false };
  }
  if (!(Number.isFinite(min) && min > 0)) {
    return {
      error: "Informe um valor mínimo de venda maior que zero.",
      ok: false,
    };
  }
  await savePaymentSettings({
    templateResaleFeePercent: round2(fee),
    templateResaleMinPriceBrl: min,
  });
  revalidatePath(PATH);
  return { ok: true };
}
