import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  type BuilderSite,
  LIVE_EXCLUSIVITY_STATUSES,
  pgSystemConfig,
  pgTemplateExclusivity,
  pgTemplateExclusivitySetting,
  type TemplateExclusivity,
} from "@/lib/db/schema";
import {
  applyAnyMinPrice,
  blocksOthers,
  normalizeResaleConfig,
  type ResaleConfig,
  type TemplateExclusivityState,
  templateStateFor,
} from "./rules";

/**
 * `TEMPLATE_RESALE_ANY_MIN_PRICE=true` (variável de ambiente, configurável no
 * Komodo) ignora o piso de venda do admin: o dono pode definir qualquer valor
 * mínimo (ex.: R$ 1 para testar o pagamento). A taxa do Atlas continua sendo
 * cobrada. Ausente ou != "true" mantém o piso.
 */
export function isAnyMinPriceEnabled(): boolean {
  return (
    process.env.TEMPLATE_RESALE_ANY_MIN_PRICE?.trim().toLowerCase() === "true"
  );
}

/** Taxa e piso exatamente como o admin salvou (sem o modo de teste). */
export async function getStoredResaleConfig(): Promise<ResaleConfig> {
  const [config] = await db
    .select({
      feePercent: pgSystemConfig.templateResaleFeePercent,
      minPriceBrl: pgSystemConfig.templateResaleMinPriceBrl,
    })
    .from(pgSystemConfig)
    .limit(1);
  return normalizeResaleConfig(config ?? {});
}

/** Taxa do Atlas e piso de venda em vigor (o piso some com o modo de teste). */
export async function getResaleConfig(): Promise<ResaleConfig> {
  return applyAnyMinPrice(
    await getStoredResaleConfig(),
    isAnyMinPriceEnabled()
  );
}

/** Registro "vivo" (reservado, ativo ou em carência) de um template, se houver. */
export async function getLiveExclusivity(
  templateId: string
): Promise<TemplateExclusivity | undefined> {
  const [row] = await db
    .select()
    .from(pgTemplateExclusivity)
    .where(
      and(
        eq(pgTemplateExclusivity.templateId, templateId),
        inArray(pgTemplateExclusivity.status, [...LIVE_EXCLUSIVITY_STATUSES])
      )
    )
    .limit(1);
  return row;
}

/** Estado de cada template para quem está vendo a galeria. */
export async function getTemplateExclusivityMap(
  viewerId: string
): Promise<Record<string, TemplateExclusivityState>> {
  const [settings, live, resale] = await Promise.all([
    db.select().from(pgTemplateExclusivitySetting),
    db
      .select()
      .from(pgTemplateExclusivity)
      .where(
        inArray(pgTemplateExclusivity.status, [...LIVE_EXCLUSIVITY_STATUSES])
      ),
    getResaleConfig(),
  ]);

  const ids = new Set([
    ...settings.map(row => row.templateId),
    ...live.map(row => row.templateId),
  ]);
  const map: Record<string, TemplateExclusivityState> = {};
  for (const id of ids) {
    map[id] = templateStateFor({
      exclusivity: live.find(row => row.templateId === id),
      floor: resale.minPriceBrl,
      setting: settings.find(row => row.templateId === id),
      viewerId,
    });
  }
  return map;
}

export async function getTemplateState(
  templateId: string,
  viewerId: string
): Promise<TemplateExclusivityState> {
  const [setting] = await db
    .select()
    .from(pgTemplateExclusivitySetting)
    .where(eq(pgTemplateExclusivitySetting.templateId, templateId))
    .limit(1);
  const [exclusivity, resale] = await Promise.all([
    getLiveExclusivity(templateId),
    getResaleConfig(),
  ]);
  return templateStateFor({
    exclusivity,
    floor: resale.minPriceBrl,
    setting,
    viewerId,
  });
}

/** Erro amigável quando o usuário não pode criar site com o template. */
export async function templateUseError(
  templateId: string,
  userId: string
): Promise<string | null> {
  const state = await getTemplateState(templateId, userId);
  if (!blocksOthers(state)) return null;
  return state.kind === "reserved"
    ? "Este template está sendo adquirido com exclusividade por outra pessoa."
    : "Este template é exclusivo de outro usuário. Você pode fazer uma proposta para comprá-lo.";
}

/** Site bloqueado porque outra pessoa tem a exclusividade do template. */
export function isSiteBlocked(
  site: Pick<BuilderSite, "exclusivityBlockedAt">
): boolean {
  return Boolean(site.exclusivityBlockedAt);
}

export const BLOCKED_SITE_MESSAGE =
  "Este site foi bloqueado porque o template agora é exclusivo de outro usuário. Crie um site novo com outro template.";
