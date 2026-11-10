import type { SiteTemplate, TemplateMeta } from "../model/index.js";
import { areaflix } from "./areaflix/index.js";
import { blogViagens } from "./blog-viagens/index.js";
import { centralMarketing } from "./central-marketing/index.js";
import { controleMotorista } from "./controle-motorista/index.js";
import { controlePatrimonial } from "./controle-patrimonial/index.js";
import { habilidadesComunicacao } from "./habilidades-comunicacao/index.js";
import { holofote } from "./holofote/index.js";
import { margem } from "./margem/index.js";
import { marketingRaiz } from "./marketing-raiz/index.js";
import { marketplace } from "./marketplace/index.js";
import { outroLadoInternet } from "./outro-lado-internet/index.js";
import { pagatg } from "./pagatg/index.js";
import { portalNoticias } from "./portal-noticias/index.js";
import { seguidoresEmAlta } from "./seguidores-em-alta/index.js";
import { simIntermediacoes } from "./sim-intermediacoes/index.js";
import { spyhacker } from "./spyhacker/index.js";
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
  controlePatrimonial,
  controleMotorista,
  simIntermediacoes,
  pagatg,
  outroLadoInternet,
  habilidadesComunicacao,
  zyrion,
  holofote,
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
