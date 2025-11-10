import { render } from "@react-email/render";
import {
  AtlasWelcomeEmail,
  AtlasPasswordResetEmail,
  AtlasNotificationEmail,
  AtlasChangeEmail,
} from "@/emails";
import { emailService } from "../consts/singletons";

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
  try {
    await emailService.sendEmail({
      from: "noreply@atlashosting.com.br",
      to: data.to,
      subject: data.subject,
      body: data.html,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Email sending failed");
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
  const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`;

  const html = await render(
    AtlasWelcomeEmail({
      firstName,
      organizationName,
      dashboardUrl,
      supportEmail: "contact@atlashosting.com.br",
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
  resetToken: string,
  resetCode: string
): Promise<void> {
  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;

  const html = await render(
    AtlasPasswordResetEmail({
      firstName,
      email,
      resetLink,
      resetCode,
      expirationTime: "1 hora",
      supportEmail: "contact@atlashosting.com.br",
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
  const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${verificationToken}`;

  const html = await render(
    AtlasNotificationEmail({
      firstName,
      organizationName: "Atlas Hosting",
      title: "Verificar seu endereço de email",
      message:
        `Para completar o cadastro da sua conta, você precisa verificar seu endereço de email. Use o código abaixo na página de verificação:\n\nCódigo: ${verificationCode}`,
      severity: "info",
      actionUrl: verificationLink,
      actionText: "Verificar Email",
      timestamp: new Date().toLocaleString("pt-BR"),
      supportEmail: "contact@atlashosting.com.br",
      additionalInfo:
        `Código de verificação: ${verificationCode}\nEste código expira em 24 horas. Se você não solicitou esta verificação, pode ignorar este email.`,
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
  const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/change-email/verify?token=${verificationToken}&email=${encodeURIComponent(newEmail)}`;

  const html = await render(
    AtlasChangeEmail({
      firstName,
      currentEmail,
      newEmail,
      verificationLink,
      expirationTime: "24 horas",
      supportEmail: "contact@atlashosting.com.br",
    })
  );

  await sendEmail({
    to: newEmail,
    subject: "Confirmar alteração de email - Atlas Hosting",
    html,
  });
}
