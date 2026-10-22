import { readFileSync } from "node:fs";
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

/**
 * Senha via SMTP_PASSWORD_BASE64 evita `$` ser comido por Docker Swarm / Compose
 * (`j0M$s5e55` vira só `j0M` quando `$s5e55` é tratado como variável vazia).
 * Gerar: `node -e "console.log(Buffer.from('SUA_SENHA','utf8').toString('base64'))"`
 */
function resolveSmtpPassword(): string {
  const b64 = envTrim(process.env.SMTP_PASSWORD_BASE64);
  if (b64) {
    try {
      const decoded = Buffer.from(b64, "base64").toString("utf8");
      if (decoded.length > 0) {
        return decoded.replace(/\r?\n$/, "");
      }
    } catch {
      console.error("[email] SMTP_PASSWORD_BASE64 inválido");
    }
  }

  const filePath = envTrim(process.env.SMTP_PASSWORD_FILE);
  if (filePath) {
    try {
      // @ts-ignore
      const raw = readFileSync(/*turbopackIgnore: true*/ filePath, "utf8");
      const fromFile = raw.replace(/\r?\n$/, "").trim();
      if (fromFile.length > 0) {
        return fromFile;
      }
    } catch {
      console.error("[email] SMTP_PASSWORD_FILE ilegível:", filePath);
    }
  }

  return envTrim(
    process.env.SMTP_PASSWORD || process.env.EMAIL_SERVER_PASSWORD
  );
}

function resolveSmtpConfig() {
  const user = envTrim(
    process.env.SMTP_USER ||
      process.env.SMTP_USERNAME ||
      process.env.EMAIL_SERVER_USER
  );
  const host = envTrim(process.env.SMTP_HOST || process.env.EMAIL_SERVER_HOST);
  const portRaw = envTrim(
    process.env.SMTP_PORT ?? process.env.EMAIL_SERVER_PORT
  );
  const port = portRaw ? Number(portRaw) : 465;
  const password = resolveSmtpPassword();
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

  return { fromEmail, host, password, port, secure, user };
}

let warnedSmtpPasswordLikelyTruncated = false;

/** Metadados para diagnóstico sem registrar a senha em claro. */
export function getSmtpRedactedMeta() {
  const c = resolveSmtpConfig();
  const bytes = Buffer.from(c.password, "utf8");
  const prefix = bytes.subarray(0, Math.min(16, bytes.length));
  const fromBase64 = Boolean(envTrim(process.env.SMTP_PASSWORD_BASE64));
  const fromFile = Boolean(envTrim(process.env.SMTP_PASSWORD_FILE));
  let passwordSource: string;
  if (fromBase64) {
    passwordSource = "SMTP_PASSWORD_BASE64";
  } else if (fromFile) {
    passwordSource = "SMTP_PASSWORD_FILE";
  } else {
    passwordSource = "SMTP_PASSWORD";
  }
  return {
    fromEmail: c.fromEmail,
    host: c.host,
    passwordDollarCount: (c.password.match(/\$/g) ?? []).length,
    passwordLength: c.password.length,
    passwordSource,
    /** Primeiros bytes UTF-8 em hex; para `j0M$s5e55` espera-se `6a304d24...` (24 = `$`) */
    passwordUtf8PrefixHex: prefix.toString("hex"),
    port: c.port,
    secure: c.secure,
    user: c.user,
    userLength: c.user.length,
  };
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
  if (process.env.SMTP_DEBUG === "true") {
    console.log("[email/smtp] SMTP_DEBUG", getSmtpRedactedMeta());
  }
  if (
    !warnedSmtpPasswordLikelyTruncated &&
    !envTrim(process.env.SMTP_PASSWORD_BASE64) &&
    !envTrim(process.env.SMTP_PASSWORD_FILE) &&
    password.length > 0 &&
    password.length <= 4
  ) {
    warnedSmtpPasswordLikelyTruncated = true;
    console.warn(
      "[email] SMTP_PASSWORD curta demais — no Docker Swarm a variável pode ser expandida 2x: após virar `j0M$s5e55`, `$s5e55` some de novo. Use: (A) `SMTP_PASSWORD_BASE64`; (B) `SMTP_PASSWORD_FILE` + secret montado no container; (C) no stack YAML use quatro `$` por cada `$` real na senha, ex.: `j0M$$$$s5e55`."
    );
  }
  return new EmailService(user, host, port, password, secure, fromEmail);
}
