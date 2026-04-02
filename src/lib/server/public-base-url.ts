/**
 * URL pública usada em links de e-mail e no servidor (lida em runtime).
 *
 * Não use `NEXT_PUBLIC_*` aqui: o Next embute esses valores no **build**; imagens Docker
 * geradas com `localhost` ignorariam o Portainer. Use `APP_BASE_URL` ou `SERVER_PUBLIC_URL`
 * no stack (runtime). Opcionalmente mantenha `NEXT_PUBLIC_BASE_URL` só para o browser.
 */
export function getServerPublicBaseUrl(): string {
  const raw =
    process.env.APP_BASE_URL?.trim() ||
    process.env.SERVER_PUBLIC_URL?.trim();
  if (raw) {
    return raw.replace(/\/$/, "");
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel}`.replace(/\/$/, "");
  }
  if (process.env.NODE_ENV === "production") {
    return "https://atlashosting.com.br";
  }
  return "http://localhost:3000";
}
