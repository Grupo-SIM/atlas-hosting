import { render } from "@react-email/render";
import {
  AtlasWelcomeEmail,
  AtlasPasswordResetEmail,
  AtlasNotificationEmail,
  AtlasChangeEmail,
} from "@/emails";
import { getServerPublicBaseUrl } from "@/lib/server/public-base-url";
import { getEmailService, getSmtpRedactedMeta } from "../consts/singletons";

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

  try {
    await emailService.sendEmail({
      from: "noreply@atlashosting.com.br",
      to: data.to,
      subject: data.subject,
      body: data.html,
    });
  } catch (error) {
    console.error(`Failed to send email to ${data.to}:`, error);
    console.error("[email] SMTP usado no envio (sem senha):", getSmtpRedactedMeta());
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
      firstName,
      organizationName,
      dashboardUrl,
      supportEmail: "contact@atlashosting.com.br",
      publicSiteUrl: siteUrl,
    })
  );

  await sendEmail({
    to: email,
    subject: "Bem-vindo ao Atlas Hosting!",
    html,
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
      firstName,
      email,
      resetLink,
      expirationTime: "1 hora",
      supportEmail: "contact@atlashosting.com.br",
      publicSiteUrl: siteUrl,
    })
  );

  await sendEmail({
    to: email,
    subject: "Redefinir senha - Atlas Hosting",
    html,
  });
}

/**
 * Send email verification email
 */
export async function sendEmailVerificationEmail(
  email: string,
  firstName: string,
  verificationToken: string,
  verificationCode: string
): Promise<void> {
  const siteUrl = getServerPublicBaseUrl();
  const verificationLink = `${siteUrl}/verify-email?token=${encodeURIComponent(verificationToken)}`;

  const html = await render(
    AtlasNotificationEmail({
      firstName,
      organizationName: "Atlas Hosting",
      title: "Verificar seu endereço de email",
      message:
        "Para completar o cadastro da sua conta, você precisa verificar seu endereço de email. Use o código abaixo na página de verificação:",
      verificationCode,
      severity: "info",
      actionUrl: verificationLink,
      actionText: "Verificar Email",
      timestamp: new Date().toLocaleString("pt-BR"),
      supportEmail: "contact@atlashosting.com.br",
      additionalInfo:
        "Este código expira em 24 horas. Se você não solicitou esta verificação, pode ignorar este e-mail.",
      publicSiteUrl: siteUrl,
    })
  );

  await sendEmail({
    to: email,
    subject: "Verificar email - Atlas Hosting",
    html,
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
      firstName,
      organizationName,
      title,
      message,
      severity,
      actionUrl,
      actionText,
      timestamp: new Date().toLocaleString("pt-BR"),
      supportEmail: "contact@atlashosting.com.br",
      additionalInfo,
      publicSiteUrl: getServerPublicBaseUrl(),
    })
  );

  const subjectPrefix = {
    success: "✅ Sucesso",
    info: "ℹ️ Informação",
    warning: "⚠️ Aviso",
    danger: "🚨 Alerta",
  }[severity];

  await sendEmail({
    to: email,
    subject: `${subjectPrefix} - ${title}`,
    html,
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
      firstName,
      currentEmail,
      newEmail,
      verificationLink,
      expirationTime: "24 horas",
      supportEmail: "contact@atlashosting.com.br",
      publicSiteUrl: siteUrl,
    })
  );

  await sendEmail({
    to: newEmail,
    subject: "Confirmar alteração de email - Atlas Hosting",
    html,
  });
}
