"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  listMyNotifications,
  markNotificationsRead,
} from "@/app/(auth)/notificacoes/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Notification } from "@/lib/db/schema";

const POLL_MS = 60_000;

export function NotificationBell() {
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [, startTransition] = useTransition();

  useEffect(() => {
    let alive = true;
    const load = () =>
      listMyNotifications(8)
        .then(result => {
          if (!alive) return;
          setItems(result.items);
          setUnread(result.unread);
        })
        .catch(() => {});
    load();
    const timer = setInterval(load, POLL_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  const open = (item: Notification) => {
    if (!item.readAt) {
      setUnread(value => Math.max(0, value - 1));
      setItems(list =>
        list.map(entry =>
          entry.id === item.id ? { ...entry, readAt: new Date() } : entry
        )
      );
      startTransition(() => {
        markNotificationsRead(item.id).catch(() => {});
      });
    }
    if (item.href) router.push(item.href);
  };

  const readAll = () => {
    setUnread(0);
    setItems(list => list.map(entry => ({ ...entry, readAt: new Date() })));
    startTransition(() => {
      markNotificationsRead().catch(() => {});
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={true}>
        <Button
          aria-label={
            unread > 0 ? `Notificações (${unread} não lidas)` : "Notificações"
          }
          className="relative h-8 w-8 rounded-full"
          size="icon"
          variant="ghost"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="-top-0.5 -right-0.5 absolute flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 font-semibold text-[10px] text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80" sideOffset={12}>
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {unread > 0 && (
            <button
              className="font-normal text-muted-foreground text-xs hover:text-foreground"
              onClick={readAll}
              type="button"
            >
              Marcar todas como lidas
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <p className="px-2 py-6 text-center text-muted-foreground text-sm">
            Nenhuma notificação por aqui.
          </p>
        ) : (
          items.map(item => (
            <DropdownMenuItem
              className="flex cursor-pointer flex-col items-start gap-0.5 py-2"
              key={item.id}
              onSelect={() => open(item)}
            >
              <span className="flex w-full items-center gap-2 font-medium text-sm">
                {!item.readAt && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                )}
                <span className="truncate">{item.title}</span>
              </span>
              <span className="line-clamp-2 text-muted-foreground text-xs">
                {item.body}
              </span>
              <span className="text-[11px] text-muted-foreground/80">
                {formatDistanceToNow(new Date(item.createdAt), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild={true} className="cursor-pointer justify-center">
          <Link href="/notificacoes">Ver todas</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
