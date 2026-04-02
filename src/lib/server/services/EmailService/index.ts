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
      host: this.host,
      port: this.port,
      secure: this.secure,
      auth: {
        user: this.username,
        pass: this.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
      debug: process.env.SMTP_DEBUG === "true",
      logger: process.env.SMTP_DEBUG === "true",
    });
  }

  public async sendEmail(message: EmailMessage): Promise<void> {
    await this.transporter.sendMail({
      from: this.fromEmail,
      to: message.to,
      subject: message.subject,
      html: message.body,
    });
  }
}

export interface EmailMessage {
  from: string;
  to: string;
  subject: string;
  body: string;
}
