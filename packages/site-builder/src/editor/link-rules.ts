/**
 * Regras dos links e URLs que a pessoa digita no editor. O site publicado já bloqueia esquemas perigosos na hora de
 * renderizar (`safeUrl`); aqui o aviso vem antes, enquanto ela digita, e o que dá para consertar sozinho é consertado.
 */
const DANGEROUS = /^\s*(?:javascript|data|vbscript):/i;
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;
// Endereço sem o "https://": começa com "www." ou é um domínio conhecido (evita confundir com "sobre.html").
const BARE_DOMAIN =
  /^(?:www\.|[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|net|org|io|app|dev|me|co|tv|info|biz|xyz|gov|edu)(?:\.[a-z]{2})?(?:[/?#]|$))/i;

/** `www.site.com` → `https://www.site.com`. O resto fica como a pessoa digitou (só sem espaços nas pontas). */
export function normalizeLink(value: string): string {
  const v = value.trim();
  if (!v || v.startsWith("/") || v.startsWith("#") || HAS_SCHEME.test(v))
    return v;
  return BARE_DOMAIN.test(v) ? `https://${v}` : v;
}

/** O que está errado no link, em português; `null` se serve (ou se está vazio). */
export function linkProblem(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (DANGEROUS.test(v)) return "Esse tipo de link não é permitido.";
  if (/\s/.test(v))
    return "O link não pode ter espaços. Se for um endereço, copie-o inteiro.";
  if (v.startsWith("//")) return null;
  if (v.startsWith("/") || v.startsWith("#")) return null;
  if (/^(?:mailto|tel|sms|whatsapp):/i.test(v)) return null;
  if (/^https?:\/\//i.test(v)) {
    try {
      const host = new URL(v).hostname;
      return host.includes(".") || host === "localhost"
        ? null
        : "O endereço parece incompleto (falta o domínio, como .com).";
    } catch {
      return "O endereço não é válido. Confira se copiou o link inteiro.";
    }
  }
  if (HAS_SCHEME.test(v)) return "Use um link que comece com https://.";
  return BARE_DOMAIN.test(v)
    ? null
    : "Comece o link com https:// (ou com / para uma página do próprio site).";
}

/**
 * URL de imagem ou vídeo colada no campo de mídia: precisa ser http(s) (ou um caminho do próprio site). Não aceita
 * `data:` nem arquivos do computador (`file:`, `C:\…`), que só funcionariam na máquina de quem editou.
 */
export function mediaUrlProblem(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  // Imagem embutida no próprio valor (os templates usam para os espaços de imagem): é só uma imagem, não executa.
  if (/^data:image\/(?:png|jpe?g|gif|webp|avif|svg\+xml)[;,]/i.test(v))
    return null;
  if (DANGEROUS.test(v)) return "Esse tipo de link não é permitido.";
  if (/^(?:file:|[a-z]:[\\/])/i.test(v))
    return "Esse endereço é de um arquivo do seu computador. Use o botão de enviar acima.";
  if (/^blob:/i.test(v))
    return "Esse endereço é temporário. Use o botão de enviar acima.";
  if (/\s/.test(v)) return "O endereço não pode ter espaços.";
  if (v.startsWith("/") && !v.startsWith("//")) return null;
  if (!/^https?:\/\//i.test(v))
    return "Cole um endereço que comece com https://.";
  try {
    new URL(v);
    return null;
  } catch {
    return "O endereço não é válido. Confira se copiou o link inteiro.";
  }
}
