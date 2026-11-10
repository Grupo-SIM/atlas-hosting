import { resolve4 } from "node:dns/promises";

/**
 * - `live`: o domínio aponta para o servidor e responde por HTTPS.
 * - `no_dns`: o domínio ainda não resolve para o servidor (propagação).
 * - `no_site`: o DNS já aponta para o servidor, mas o HTTPS ainda não responde
 *   (certificado sendo emitido ou site subindo).
 */
export type LiveState = "live" | "no_dns" | "no_site";

const IPV4_RE = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const TIMEOUT_MS = 6000;

export interface LiveCheckDeps {
  fetchHead: (url: string) => Promise<number>;
  resolve4: (host: string) => Promise<string[]>;
}

const defaultDeps: LiveCheckDeps = {
  fetchHead: async url => {
    const res = await fetch(url, {
      cache: "no-store",
      method: "HEAD",
      // Sem seguir redirecionamentos: só interessa se o servidor do site respondeu.
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return res.status;
  },
  resolve4: host => resolve4(host),
};

/**
 * Confere se o site publicado já abre. O HTTPS só é consultado depois que o DNS
 * resolve para o servidor da publicação (`expectedTarget`: IP ou hostname), para
 * esta checagem nunca bater em outro endereço.
 */
export async function checkSiteLive(
  domain: string,
  expectedTarget: string,
  deps: LiveCheckDeps = defaultDeps
): Promise<LiveState> {
  const expected = IPV4_RE.test(expectedTarget)
    ? [expectedTarget]
    : await deps.resolve4(expectedTarget).catch(() => []);
  if (expected.length === 0) return "no_dns";

  const resolved = await deps.resolve4(domain).catch(() => []);
  if (!resolved.some(ip => expected.includes(ip))) return "no_dns";

  try {
    const status = await deps.fetchHead(`https://${domain}/`);
    return status < 500 ? "live" : "no_site";
  } catch {
    return "no_site";
  }
}
