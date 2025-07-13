import nodemailer from "nodemailer";

export default class EmailService {
  private transporter: nodemailer.Transporter;

  /**
   */
  public constructor(
    private readonly username: string,
    private readonly host: string,
    private readonly port: number,
    private readonly password: string
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.host,
      port: this.port,
      secure: this.port === 465,
      auth: {
        user: this.username,
        pass: this.password,
      },
    });
  }

  public async sendEmail(message: EmailMessage): Promise<void> {
    await this.transporter.sendMail({
      from: "noreply@atlashosting.com.br",
      to: message.to,
      subject: message.subject,
      sender: message.from,
      html: message.body
    });
  }
}

export interface EmailMessage {
  from: string;
  to: string;
  subject: string;
  body: string;
}
