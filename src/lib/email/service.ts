import path from "node:path";
import { render } from "@react-email/render";
import {
  AtlasChangeEmail,
  AtlasNotificationEmail,
  AtlasPasswordResetEmail,
  AtlasWelcomeEmail,
} from "@/emails";
import { getServerPublicBaseUrl } from "@/lib/server/public-base-url";
import { getEmailService, getSmtpRedactedMeta } from "../consts/singletons";

/** Cid usado no `<Img src="cid:atlaslogo" />` dos templates — evita logo quebrada
 * quando o cliente de email (ex. Gmail) bloqueia carregamento de imagem externa. */
const LOGO_CID = "atlaslogo";

// Email configuration - you'll need to configure this with your email provider
interface EmailConfig {
  from: string;
  replyTo?: string;
  provider: "smtp" | "sendgrid" | "resend" | "ses";
  apiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using the configured provider
 */
async function sendEmail(data: EmailData): Promise<void> {
  console.log(`Sending email to ${data.to} with subject: ${data.subject}`);

  // In development, just log the email
  // if (process.env.NODE_ENV === "development") {
  //   console.log("Email HTML:", data.html);
  //   return;
  // }

  // TODO: Implement actual email sending based on provider
  // For now, we'll just log it
  const emailService = getEmailService();
  if (!emailService) {
    console.error(
      `[email] Não foi possível enviar para ${data.to}: SMTP não configurado.`
    );
    return;
  }

  const usesLogoCid = data.html.includes(`cid:${LOGO_CID}`);

  try {
    await emailService.sendEmail({
      attachments: usesLogoCid
        ? [
            {
              cid: LOGO_CID,
              contentDisposition: "inline",
              contentType: "image/png",
              filename: "atlas-logo.png",
              path: path.join(process.cwd(), "public", "atlas-logo.png"),
            },
          ]
        : undefined,
      body: data.html,
      from: "noreply@atlashosting.com.br",
      subject: data.subject,
      to: data.to,
    });
  } catch (error) {
    console.error(`Failed to send email to ${data.to}:`, error);
    console.error(
      "[email] SMTP usado no envio (sem senha):",
      getSmtpRedactedMeta()
    );
    // Do not re-throw — email failures must never block user creation or other actions
  }
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
  email: string,
  firstName: string,
  organizationName: string
): Promise<void> {
  const siteUrl = getServerPublicBaseUrl();
  const dashboardUrl = `${siteUrl}/home`;

  const html = await render(
    AtlasWelcomeEmail({
      dashboardUrl,
      firstName,
      organizationName,
      publicSiteUrl: siteUrl,
      supportEmail: "contact@atlashosting.com.br",
    })
  );

  await sendEmail({
    html,
    subject: "Bem-vindo ao Atlas Hosting!",
    to: email,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  firstName: string,
  resetToken: string
): Promise<void> {
  const siteUrl = getServerPublicBaseUrl();
  const resetLink = `${siteUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;

  const html = await render(
    AtlasPasswordResetEmail({
      email,
      expirationTime: "1 hora",
      firstName,
      publicSiteUrl: siteUrl,
      resetLink,
      supportEmail: "contact@atlashosting.com.br",
    })
  );

  await sendEmail({
    html,
    subject: "Redefinir senha - Atlas Hosting",
    to: email,
  });
}

/**
 * Send email verification email
 */
export async function sendEmailVerificationEmail(
  email: string,
  verificationToken: string,
  verificationCode: string
): Promise<void> {
  const siteUrl = getServerPublicBaseUrl();
  const verificationLink = `${siteUrl}/verify-email?token=${encodeURIComponent(verificationToken)}&email=${encodeURIComponent(email)}`;

  const html = await render(
    AtlasNotificationEmail({
      actionText: "Verificar Email",
      actionUrl: verificationLink,
      additionalInfo:
        "Este código expira em 24 horas. Se você não solicitou esta verificação, pode ignorar este e-mail.",
      firstName: email,
      message:
        "Para completar o seu cadastro, você precisa verificar seu endereço de email. Use o código abaixo na página de verificação:",
      organizationName: "Atlas Hosting",
      publicSiteUrl: siteUrl,
      severity: "info",
      supportEmail: "contact@atlashosting.com.br",
      timestamp: new Date().toLocaleString("pt-BR"),
      title: "Verificar seu endereço de email",
      verificationCode,
    })
  );

  await sendEmail({
    html,
    subject: "Verificar email - Atlas Hosting",
    to: email,
  });
}

/**
 * Send notification email
 */
export async function sendNotificationEmail(
  email: string,
  firstName: string,
  organizationName: string,
  title: string,
  message: string,
  severity: "success" | "info" | "warning" | "danger",
  actionUrl?: string,
  actionText?: string,
  additionalInfo?: string
): Promise<void> {
  const html = await render(
    AtlasNotificationEmail({
      actionText,
      actionUrl,
      additionalInfo,
      firstName,
      message,
      organizationName,
      publicSiteUrl: getServerPublicBaseUrl(),
      severity,
      supportEmail: "contact@atlashosting.com.br",
      timestamp: new Date().toLocaleString("pt-BR"),
      title,
    })
  );

  const subjectPrefix = {
    danger: "🚨 Alerta",
    info: "ℹ️ Informação",
    success: "✅ Sucesso",
    warning: "⚠️ Aviso",
  }[severity];

  await sendEmail({
    html,
    subject: `${subjectPrefix} - ${title}`,
    to: email,
  });
}

/**
 * Send change email verification email
 */
export async function sendChangeEmailVerificationEmail(
  newEmail: string,
  firstName: string,
  currentEmail: string,
  verificationToken: string
): Promise<void> {
  const siteUrl = getServerPublicBaseUrl();
  const verificationLink = `${siteUrl}/change-email/verify?token=${encodeURIComponent(verificationToken)}&email=${encodeURIComponent(newEmail)}`;

  const html = await render(
    AtlasChangeEmail({
      currentEmail,
      expirationTime: "24 horas",
      firstName,
      newEmail,
      publicSiteUrl: siteUrl,
      supportEmail: "contact@atlashosting.com.br",
      verificationLink,
    })
  );

  await sendEmail({
    html,
    subject: "Confirmar alteração de email - Atlas Hosting",
    to: newEmail,
  });
}
