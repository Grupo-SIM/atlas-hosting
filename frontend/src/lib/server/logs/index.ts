import EventEmitter from "node:events";
import type { LogInsert, User } from "@/lib/db/schema";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
class AppLoggerQueue {
  private static eventTarget = new EventEmitter();

  public static send(message: LogInsert): void {
    AppLoggerQueue.eventTarget.emit("log", message);
  }
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
