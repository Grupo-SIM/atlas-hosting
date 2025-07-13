import EventEmitter from "node:events";
import { getUser, getUserSettings } from "@/lib/auth";
import { emailService } from "@/lib/consts/singletons";
import { db } from "@/lib/db";
import {
  type Log,
  type LogInsert,
  type User,
  pgLog,
  pgUser,
} from "@/lib/db/schema";
import { format } from "date-fns";
import { eq } from "drizzle-orm";
import { ptBR } from "date-fns/locale";
import { render } from "@react-email/render";
import { AtlasNotificationEmail } from "@/emails";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
class AppLoggerQueue {
  private static eventTarget = new EventEmitter();

  public static send(message: LogInsert): void {
    AppLoggerQueue.eventTarget.emit("log", message);
  }

  private static onLogEvent = async (event: LogInsert): Promise<void> => {
    console.log("AppLoggerQueue.onLogEvent", event);

    try {
      await db.insert(pgLog).values(event).returning();
      this.sendNotifications(event as Log);
    } catch (error) {
      console.error("Failed to log message:", error);
    }
  };

  private static async sendNotifications(message: Log): Promise<void> {
    const { userId } = message;
    const settings = await getUserSettings(userId);

    if (!settings) {
      return;
    }

    if (settings.emailNotifications) {
      const { email } = (await db.query.pgUser.findFirst({
        where: eq(pgUser.id, userId),
      })) as Pick<User, "email">;

      if (!email) {
        console.warn(
          `User with ID ${userId} not found for email notification.`
        );
        return;
      }

      try {
        const user = await getUser();

        const rendered = await render(
          AtlasNotificationEmail({
            firstName: user?.name,
            title: message.title,
            message: message.title,
            severity: message.severity,
            timestamp: new Date().toLocaleString("pt-BR"),
            supportEmail: "contact@atlashosting.com.br",
            organizationName: user?.organization?.name,
          })
        );

        await emailService.sendEmail({
          from: "Atlas Hosting <noreply@atlashosting.com.br>",
          to: email,
          subject: `${message.title} - Atlas Hosting`,
          body: rendered,
        });
      } catch (error) {
        console.error(`Failed to send email notification to ${email}:`, error);
      }
    }
  }

  private static _constructor = (() => {
    this.eventTarget.on("log", AppLoggerQueue.onLogEvent);
  })();
}

export class AppLogger {
  constructor(private readonly user: Pick<User, "id">) {}

  public log(message: Omit<LogInsert, "userId">): void {
    AppLoggerQueue.send({
      ...message,
      userId: this.user.id,
    });
  }
}
