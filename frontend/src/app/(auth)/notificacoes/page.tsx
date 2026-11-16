import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgNotification } from "@/lib/db/schema";
import { markNotificationsRead } from "./actions";

export const metadata: Metadata = {
  title: "Notificações - Atlas Hosting",
};

async function readAll() {
  "use server";
  await markNotificationsRead();
}

export default async function NotificationsPage() {
  const user = await getUser();
  const items = await db
    .select()
    .from(pgNotification)
    .where(eq(pgNotification.userId, user.id))
    .orderBy(desc(pgNotification.createdAt))
    .limit(200);
  const hasUnread = items.some(item => !item.readAt);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Notificações</h1>
          <p className="mt-1 text-muted-foreground">
            Avisos da sua conta, propostas e prazos.
          </p>
        </div>
        {hasUnread && (
          <form action={readAll}>
            <Button type="submit" variant="outline">
              Marcar todas como lidas
            </Button>
          </form>
        )}
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Nenhuma notificação por aqui.
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {items.map(item => {
            const content = (
              <Card
                className={
                  item.readAt ? "opacity-75" : "border-primary/40 bg-primary/5"
                }
              >
                <CardContent className="space-y-1 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium">{item.title}</p>
                    <span className="shrink-0 text-muted-foreground text-xs">
                      {format(item.createdAt, "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <p className="whitespace-pre-line text-muted-foreground text-sm">
                    {item.body}
                  </p>
                </CardContent>
              </Card>
            );
            return (
              <li key={item.id}>
                {item.href ? (
                  <Link className="block" href={item.href}>
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
