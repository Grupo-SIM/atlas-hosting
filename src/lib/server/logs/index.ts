import { db } from "@/lib/db";
import { type LogInsert, pgLog, type User } from "@/lib/db/schema";
import EventEmitter from "events";

class AppLoggerQueue {
  private static eventTarget = new EventEmitter();

  public static send(message: LogInsert): void {
    this.eventTarget.emit("log", message);
  }

  private static onLogEvent = async (event: LogInsert): Promise<void> => {
    console.log("AppLoggerQueue.onLogEvent", event);

    try {
      await db.insert(pgLog).values(event).returning();
    } catch (error) {
      console.error("Failed to log message:", error);
    }
  };

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
