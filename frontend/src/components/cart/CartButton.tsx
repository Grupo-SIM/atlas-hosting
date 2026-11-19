"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCartItems } from "@/lib/cart/store";
import { cn } from "@/lib/utils";

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-500 px-1 font-bold text-[10px] text-white leading-none">
      {count}
    </span>
  );
}

/**
 * Ícone do carrinho com contador. `app` é igual ao sino do topo do painel;
 * `landing` segue o header escuro da landing.
 */
export function CartButton({
  variant = "app",
  className,
}: {
  variant?: "app" | "landing";
  className?: string;
}) {
  const count = useCartItems().length;
  const label =
    count > 0
      ? `Carrinho (${count} ${count === 1 ? "item" : "itens"})`
      : "Carrinho";

  if (variant === "app") {
    return (
      <Button
        asChild
        className={cn("relative h-8 w-8 rounded-full", className)}
        size="icon"
        variant="ghost"
      >
        <Link aria-label={label} href="/carrinho" title={label}>
          <ShoppingCart className="h-4 w-4" />
          <CountBadge count={count} />
        </Link>
      </Button>
    );
  }

  return (
    <Link
      aria-label={label}
      className={cn(
        "relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:border-sky-400/60 hover:text-sky-400",
        className
      )}
      href="/carrinho"
      title={label}
    >
      <ShoppingCart className="h-5 w-5" />
      <CountBadge count={count} />
    </Link>
  );
}
