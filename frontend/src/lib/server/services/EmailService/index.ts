import nodemailer from "nodemailer";

export default class EmailService {
  private transporter: nodemailer.Transporter;

  public constructor(
    private readonly username: string,
    private readonly host: string,
    private readonly port: number,
    private readonly password: string,
    private readonly secure: boolean = true,
    private readonly fromEmail: string = "noreply@atlashosting.com.br"
  ) {
    this.transporter = nodemailer.createTransport({
      auth: {
        pass: this.password,
        user: this.username,
      },
      debug: process.env.SMTP_DEBUG === "true",
      host: this.host,
      logger: process.env.SMTP_DEBUG === "true",
      port: this.port,
      secure: this.secure,
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  public async sendEmail(message: EmailMessage): Promise<void> {
    await this.transporter.sendMail({
      attachments: message.attachments,
      from: this.fromEmail,
      html: message.body,
      subject: message.subject,
      to: message.to,
    });
  }
}

export interface EmailAttachment {
  filename: string;
  path: string;
  cid: string;
  contentType?: string;
  contentDisposition?: "inline" | "attachment";
}

export interface EmailMessage {
  from: string;
  to: string;
  subject: string;
  body: string;
  attachments?: EmailAttachment[];
}
