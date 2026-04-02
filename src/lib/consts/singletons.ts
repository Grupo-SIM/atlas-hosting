import EmailService from "../server/services/EmailService";

/** Remove espaços e aspas externas comuns em valores colados no Portainer/.env */
function envTrim(value: string | undefined): string {
  if (value === undefined || value === "") return "";
  let v = value.trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }
  return v;
}

function resolveSmtpConfig() {
  const user = envTrim(
    process.env.SMTP_USER ||
      process.env.SMTP_USERNAME ||
      process.env.EMAIL_SERVER_USER
  );
  const host = envTrim(
    process.env.SMTP_HOST || process.env.EMAIL_SERVER_HOST
  );
  const portRaw = envTrim(
    process.env.SMTP_PORT ?? process.env.EMAIL_SERVER_PORT
  );
  const port = portRaw ? Number(portRaw) : 465;
  const password = envTrim(
    process.env.SMTP_PASSWORD || process.env.EMAIL_SERVER_PASSWORD
  );
  const smtpSecureEnv =
    process.env.SMTP_SECURE ?? process.env.EMAIL_SERVER_SECURE;
  let secure: boolean;
  if (smtpSecureEnv !== undefined) {
    secure = smtpSecureEnv !== "false";
  } else {
    secure = port !== 587;
  }
  const fromEmail =
    envTrim(process.env.SMTP_FROM_EMAIL || process.env.EMAIL_FROM) ||
    user ||
    "noreply@atlashosting.com.br";

  return { user, host, port, password, secure, fromEmail };
}

/**
 * Cria o cliente SMTP na hora do envio (não no load do módulo), para que
 * variáveis do Portainer / runtime estejam disponíveis no Next.js.
 */
export function getEmailService(): EmailService | null {
  const { user, host, port, password, secure, fromEmail } = resolveSmtpConfig();
  if (!host) {
    console.error(
      "[email] SMTP_HOST (ou EMAIL_SERVER_HOST) não definido — e-mails transacionais não serão enviados."
    );
    return null;
  }
  return new EmailService(user, host, port, password, secure, fromEmail);
}
