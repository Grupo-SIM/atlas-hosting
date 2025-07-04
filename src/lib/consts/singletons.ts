import EmailService from "../server/services/EmailService";

export const emailService = new EmailService(
  process.env.SMTP_USERNAME || "",
  process.env.SMTP_HOST || "",
  Number(process.env.SMTP_PORT) || 465,
  process.env.SMTP_PASSWORD || ""
);
