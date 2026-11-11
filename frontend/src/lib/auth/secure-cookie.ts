import { headers } from "next/headers";

/**
 * Se os cookies de sessão levam `Secure`: só em produção e quando a requisição chegou por HTTPS.
 *
 * O build de produção fixa `NODE_ENV=production`, então rodá-lo localmente (Docker em `http://localhost`
 * ou `http://0.0.0.0`) gravava o cookie com `Secure` sobre HTTP — o navegador descarta e a sessão some a
 * cada navegação. O Next preenche `x-forwarded-proto` sem sobrescrever o do proxy (o Traefik manda
 * `https` em produção); sem o cabeçalho, fica `Secure`.
 */
export async function secureCookie(): Promise<boolean> {
  if (process.env.NODE_ENV !== "production") return false;
  const proto = (await headers())
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  return proto !== "http";
}
