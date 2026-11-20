/**
 * Regras comuns das rotas que o editor chama para salvar e enviar arquivos (`/api/site-builder/...`).
 *
 * O editor usava server actions, cujo endereço muda a cada deploy: um editor aberto antes do deploy passava a falhar
 * em todo salvamento, e a pessoa perdia o que tinha feito. As rotas têm endereço fixo.
 */

/** Pedido feito pelo próprio site (o mesmo cuidado que o Next tem com server actions): bloqueia CSRF. */
export function isSameOrigin(headers: Headers): boolean {
  const origin = headers.get("origin");
  if (!origin) return false;
  const host = (headers.get("x-forwarded-host") ?? headers.get("host") ?? "")
    .split(",")[0]
    ?.trim()
    .toLowerCase();
  try {
    return Boolean(host) && new URL(origin).host.toLowerCase() === host;
  } catch {
    return false;
  }
}

export const SESSION_EXPIRED_MESSAGE =
  "Sua sessão expirou. Entre de novo em outra aba (sem fechar esta) e clique em “Tentar de novo”: suas alterações continuam aqui.";

const json = (body: unknown, status = 200) => Response.json(body, { status });

export const forbiddenOrigin = () =>
  json({ error: "Pedido recusado.", ok: false }, 403);

export const sessionExpired = () =>
  json({ error: SESSION_EXPIRED_MESSAGE, ok: false }, 401);

export const badRequest = (error: string) => json({ error, ok: false }, 400);
