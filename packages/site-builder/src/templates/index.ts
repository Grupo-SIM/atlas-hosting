import type { SiteTemplate, TemplateMeta } from "../model/index.js";
import { academiaDoCorte } from "./academia-do-corte/index.js";
import { areaflix } from "./areaflix/index.js";
import { atlasHosting } from "./atlas-hosting/index.js";
import { blogViagens } from "./blog-viagens/index.js";
import { centralMarketing } from "./central-marketing/index.js";
import { consultoriaFinanceira } from "./consultoria-financeira/index.js";
import { controleMotorista } from "./controle-motorista/index.js";
import { controlePatrimonial } from "./controle-patrimonial/index.js";
import { diarioAberto } from "./diario-aberto/index.js";
import { gatilhosMentais } from "./gatilhos-mentais/index.js";
import { granaNaHora } from "./grana-na-hora/index.js";
import { habilidadesComunicacao } from "./habilidades-comunicacao/index.js";
import { holofote } from "./holofote/index.js";
import { instafanFortune } from "./instafan-fortune/index.js";
import { margem } from "./margem/index.js";
import { marketingRaiz } from "./marketing-raiz/index.js";
import { marketplace } from "./marketplace/index.js";
import { outroLadoInternet } from "./outro-lado-internet/index.js";
import { pagatg } from "./pagatg/index.js";
import { portalNoticias } from "./portal-noticias/index.js";
import { presets757 } from "./presets-757/index.js";
import { resolvit } from "./resolvit/index.js";
import { seguidoresEmAlta } from "./seguidores-em-alta/index.js";
import { seopack } from "./seopack/index.js";
import { simIntermediacoes } from "./sim-intermediacoes/index.js";
import { spyhacker } from "./spyhacker/index.js";
import { universoLucasAcre } from "./universo-lucas-acre/index.js";
import { viralPack } from "./viral-pack/index.js";
import { vslMilionario } from "./vsl-milionario/index.js";
import { zyrion } from "./zyrion/index.js";

/** Aparecem na tela de escolha de template. */
const templates: SiteTemplate[] = [
  blogViagens,
  portalNoticias,
  centralMarketing,
  marketplace,
  seguidoresEmAlta,
  marketingRaiz,
  margem,
  areaflix,
  resolvit,
  controlePatrimonial,
  controleMotorista,
  simIntermediacoes,
  pagatg,
  outroLadoInternet,
  habilidadesComunicacao,
  presets757,
  instafanFortune,
  vslMilionario,
  gatilhosMentais,
  academiaDoCorte,
  viralPack,
  granaNaHora,
  consultoriaFinanceira,
  seopack,
  zyrion,
  holofote,
  diarioAberto,
  atlasHosting,
  universoLucasAcre,
];

/**
 * Fora da lista, mas ainda resolvidos por `getTemplate`: sites já criados guardam o
 * `templateId` e o editor usa o template original para "restaurar".
 */
const legacyTemplates: SiteTemplate[] = [spyhacker];

export const listTemplates = (): TemplateMeta[] =>
  templates.map(({ description, id, name, preview, site, tags }) => ({
    description,
    id,
    name,
    pageCount: site.pages.length,
    preview,
    tags,
  }));

/** Cópia profunda — o site do usuário nunca compartilha referência com o seed. */
export function getTemplate(id: string): SiteTemplate | undefined {
  const found = [...templates, ...legacyTemplates].find(t => t.id === id);
  return found ? structuredClone(found) : undefined;
}
