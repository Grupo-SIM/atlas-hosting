"use client";

import { Globe, Server, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { removeFromCart, useCartItems } from "@/lib/cart/store";
import { cn, toBrl } from "@/lib/utils";

/** Quantos itens o dropdown mostra; o resto fica para a página do carrinho. */
const PREVIEW_LIMIT = 5;

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-500 px-1 font-bold text-[10px] text-white leading-none">
      {count}
    </span>
  );
}

/**
 * Ícone do carrinho com contador; ao clicar abre um resumo dos itens e "Ver mais"
 * leva a `/carrinho`. `app` segue o sino do topo do painel; `landing` segue o
 * header da landing (`light` para a variante clara da Navbar).
 */
export function CartButton({
  variant = "app",
  light = false,
  className,
}: {
  variant?: "app" | "landing";
  light?: boolean;
  className?: string;
}) {
  const items = useCartItems();
  const count = items.length;
  const total = items.reduce((sum, item) => sum + item.priceBrl, 0);
  const preview = items.slice(0, PREVIEW_LIMIT);
  const hidden = count - preview.length;
  const label =
    count > 0
      ? `Carrinho (${count} ${count === 1 ? "item" : "itens"})`
      : "Carrinho";
  const isLanding = variant === "landing";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={true}>
        {isLanding ? (
          <button
            aria-label={label}
            className={cn(
              "relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors",
              light
                ? "border-slate-200 bg-white text-slate-700 shadow-sm hover:text-sky-500"
                : "border-white/15 bg-white/5 text-white hover:border-sky-400/60 hover:text-sky-400",
              className
            )}
            title={label}
            type="button"
          >
            <ShoppingCart className="h-5 w-5" />
            <CountBadge count={count} />
          </button>
        ) : (
          <Button
            aria-label={label}
            className={cn("relative h-8 w-8 rounded-full", className)}
            size="icon"
            title={label}
            variant="ghost"
          >
            <ShoppingCart className="h-4 w-4" />
            <CountBadge count={count} />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        // A Navbar da landing é fixa com z-[500]; o menu precisa ficar acima dela.
        className={cn(
          "w-80",
          isLanding && "z-[600]",
          isLanding && !light && "dark"
        )}
        sideOffset={12}
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Carrinho</span>
          {count > 0 ? (
            <span className="font-normal text-muted-foreground text-xs">
              {count} {count === 1 ? "item" : "itens"}
            </span>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {count === 0 ? (
          <p className="px-2 py-6 text-center text-muted-foreground text-sm">
            Seu carrinho está vazio.
          </p>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {preview.map(item => {
              const name = item.kind === "domain" ? item.domain : item.label;
              return (
                <div
                  className="flex items-center gap-2.5 rounded-sm px-2 py-2"
                  key={item.id}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sky-500/10 text-sky-500">
                    {item.kind === "domain" ? (
                      <Globe className="h-4 w-4" />
                    ) : (
                      <Server className="h-4 w-4" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-foreground text-sm">
                      {name}
                    </span>
                    <span className="block truncate text-muted-foreground text-xs">
                      {item.kind === "domain"
                        ? `${item.years} ${item.years === 1 ? "ano" : "anos"}`
                        : item.summary}
                    </span>
                  </span>
                  <span className="shrink-0 font-medium text-foreground text-sm">
                    {toBrl(item.priceBrl)}
                  </span>
                  <button
                    aria-label={`Remover ${name} do carrinho`}
                    className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removeFromCart(item.id)}
                    type="button"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
            {hidden > 0 ? (
              <p className="px-2 pt-1 pb-2 text-muted-foreground text-xs">
                + {hidden} {hidden === 1 ? "item" : "itens"} no carrinho
              </p>
            ) : null}
          </div>
        )}

        {count > 0 ? (
          <>
            <DropdownMenuSeparator />
            <div className="flex items-center justify-between px-2 py-1.5 text-sm">
              <span className="text-muted-foreground">Total estimado</span>
              <span className="font-semibold text-foreground">
                {toBrl(total)}
              </span>
            </div>
          </>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          asChild={true}
          className="cursor-pointer justify-center font-medium"
        >
          <Link href="/carrinho">Ver mais</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
