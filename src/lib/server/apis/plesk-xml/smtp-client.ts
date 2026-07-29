import nodemailer from "nodemailer";
import { decrypt } from "@/lib/encryption";

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
}

export interface EmailToSend {
  from: string;
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export class SmtpEmailClient {
  private transporter: nodemailer.Transporter | null = null;
  private config: SmtpConfig;

  constructor(config: SmtpConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    this.transporter = nodemailer.createTransport({
      auth: {
        pass: this.config.password,
        user: this.config.username,
      },
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure, // true for 465, false for other ports
      tls: {
        rejectUnauthorized: false, // For self-signed certificates
      },
    });

    // Verify connection
    if (this.transporter) {
      try {
        await this.transporter.verify();
        console.log("SMTP connection verified");
      } catch (error) {
        console.error("SMTP verification failed:", error);
        throw error;
      }
    }
  }

  async sendEmail(
    emailData: EmailToSend
  ): Promise<{ messageId: string; accepted: string[]; rejected: string[] }> {
    if (!this.transporter) {
      throw new Error("SMTP connection not established");
    }

    try {
      const mailOptions = {
        attachments: emailData.attachments,
        bcc: emailData.bcc
          ? Array.isArray(emailData.bcc)
            ? emailData.bcc.join(", ")
            : emailData.bcc
          : undefined,
        cc: emailData.cc
          ? Array.isArray(emailData.cc)
            ? emailData.cc.join(", ")
            : emailData.cc
          : undefined,
        from: emailData.from,
        html: emailData.html,
        subject: emailData.subject,
        text: emailData.text,
        to: Array.isArray(emailData.to)
          ? emailData.to.join(", ")
          : emailData.to,
      };

      const result = await this.transporter.sendMail(mailOptions);

      return {
        accepted: result.accepted as string[],
        messageId: result.messageId,
        rejected: result.rejected as string[],
      };
    } catch (error) {
      console.error("Failed to send email:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.transporter) {
      this.transporter.close();
      this.transporter = null;
    }
  }
}

export async function createSmtpClient(accountConfig: {
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  encryptedSmtpPassword: string;
  smtpSecure: boolean;
}): Promise<SmtpEmailClient> {
  const password = await decrypt(accountConfig.encryptedSmtpPassword);

  const config: SmtpConfig = {
    host: accountConfig.smtpHost,
    password,
    port: accountConfig.smtpPort,
    secure: accountConfig.smtpSecure,
    username: accountConfig.smtpUsername,
  };

  const client = new SmtpEmailClient(config);
  await client.connect();

  return client;
}
