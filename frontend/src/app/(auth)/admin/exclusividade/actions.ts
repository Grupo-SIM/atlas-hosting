"use server";

import { getTemplate } from "@repo/site-builder";
import { and, eq, inArray } from "drizzle-orm";
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

/** Liga/desliga a exclusividade de um template e define o preço anual. */
export async function saveTemplateExclusivity(input: {
  annualPriceBrl: number;
  enabled: boolean;
  templateId: string;
}): Promise<Result> {
  if (!(await assertAdmin())) {
    return { error: "Acesso restrito a administradores.", ok: false };
  }
  const templateId = String(input.templateId);
  if (!getTemplate(templateId)) {
    return { error: "Template não encontrado.", ok: false };
  }
  const price = round2(Number(input.annualPriceBrl));
  const enabled = Boolean(input.enabled);
  if (enabled && !(Number.isFinite(price) && price > 0)) {
    return { error: "Informe o preço anual da exclusividade.", ok: false };
  }

  if (!enabled) {
    const [owned] = await db
      .select({ id: pgTemplateExclusivity.id })
      .from(pgTemplateExclusivity)
      .where(
        and(
          eq(pgTemplateExclusivity.templateId, templateId),
          inArray(pgTemplateExclusivity.status, [
            ...OWNED_EXCLUSIVITY_STATUSES,
            "reserved",
          ])
        )
      )
      .limit(1);
    if (owned) {
      return {
        error:
          "Este template tem dono (ou uma compra em andamento). Não dá para desativar agora.",
        ok: false,
      };
    }
  }

  await db
    .insert(pgTemplateExclusivitySetting)
    .values({
      annualPriceBrl: Number.isFinite(price) && price > 0 ? price : 0,
      enabled,
      templateId,
    })
    .onConflictDoUpdate({
      set: {
        annualPriceBrl: Number.isFinite(price) && price > 0 ? price : 0,
        enabled,
        updatedAt: new Date(),
      },
      target: pgTemplateExclusivitySetting.templateId,
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
