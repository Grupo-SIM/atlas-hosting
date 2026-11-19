"use client";

import { Check, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  type AddToCartResult,
  addDomainToCart,
  addVpsToCart,
  removeDomainFromCart,
  useDomainInCart,
} from "@/lib/cart/store";
import { vpsCartSummary } from "@/lib/cart/vps-config";
import { cn } from "@/lib/utils";

function useAddedToast() {
  const router = useRouter();
  return (result: AddToCartResult, message: string) => {
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(message, {
      action: {
        label: "Ver carrinho",
        onClick: () => router.push("/carrinho"),
      },
    });
  };
}

/**
 * `landing` / `landing-icon`: botões escuros da busca da landing.
 * `app` / `app-icon`: botão `outline` do painel (shadcn).
 */
type Appearance = "landing" | "landing-icon" | "app" | "app-icon";

const LANDING_CLASS =
  "rounded-xl border-white/25 bg-transparent font-bold text-white uppercase tracking-wide transition-all hover:border-sky-500/50 hover:bg-sky-500/10 hover:text-sky-400";

export function AddDomainToCartButton({
  domain,
  priceBrl,
  years = 1,
  appearance = "app",
  className,
}: {
  domain: string;
  priceBrl: number;
  years?: number;
  appearance?: Appearance;
  className?: string;
}) {
  const isInCart = useDomainInCart();
  const notify = useAddedToast();
  const inCart = isInCart(domain);

  const toggle = () => {
    if (inCart) {
      removeDomainFromCart(domain);
      toast(`${domain} saiu do carrinho.`);
      return;
    }
    notify(
      addDomainToCart({ domain, priceBrl, years }),
      `${domain} adicionado ao carrinho.`
    );
  };

  const label = inCart ? "No carrinho" : "Adicionar ao carrinho";
  const Icon = inCart ? Check : ShoppingCart;

  if (appearance === "landing-icon" || appearance === "app-icon") {
    const isLanding = appearance === "landing-icon";
    return (
      <Button
        aria-label={
          inCart
            ? `Remover ${domain} do carrinho`
            : `Adicionar ${domain} ao carrinho`
        }
        className={cn(
          isLanding ? cn(LANDING_CLASS, "h-10 w-10") : "h-7 w-7",
          "shrink-0 p-0",
          inCart &&
            (isLanding ? "border-sky-500/50 text-sky-400" : "text-primary"),
          className
        )}
        onClick={toggle}
        size={isLanding ? "default" : "sm"}
        title={
          inCart ? "No carrinho — clique para remover" : "Adicionar ao carrinho"
        }
        type="button"
        variant="outline"
      >
        <Icon className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      className={cn(
        appearance === "landing" && LANDING_CLASS,
        appearance === "landing" && inCart && "border-sky-500/50 text-sky-400",
        className
      )}
      onClick={toggle}
      title={inCart ? "Clique para remover do carrinho" : undefined}
      type="button"
      variant="outline"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );
}

/** Adiciona vários domínios de uma vez (pacote "Amplie sua marca"). */
export function AddDomainsToCartButton({
  domains,
  className,
}: {
  domains: { domain: string; priceBrl: number }[];
  className?: string;
}) {
  const isInCart = useDomainInCart();
  const notify = useAddedToast();
  const allInCart = domains.every(d => isInCart(d.domain));

  const addAll = () => {
    let result: AddToCartResult = { ok: true };
    for (const d of domains) {
      if (isInCart(d.domain)) continue;
      result = addDomainToCart({
        domain: d.domain,
        priceBrl: d.priceBrl,
        years: 1,
      });
      if (!result.ok) break;
    }
    notify(result, `${domains.length} domínios adicionados ao carrinho.`);
  };

  return (
    <Button
      className={cn(
        LANDING_CLASS,
        allInCart && "border-sky-500/50 text-sky-400",
        className
      )}
      disabled={allInCart}
      onClick={addAll}
      type="button"
      variant="outline"
    >
      {allInCart ? (
        <Check className="h-4 w-4" />
      ) : (
        <ShoppingCart className="h-4 w-4" />
      )}
      {allInCart ? "Todos no carrinho" : "Adicionar todos ao carrinho"}
    </Button>
  );
}

/**
 * Adiciona a VPS configurada. `checkoutHref` é o mesmo link do botão "Próximo"
 * (`/checkout/personal-data?...`): o carrinho guarda a query e o servidor a lê
 * do mesmo jeito que o checkout direto.
 */
export function AddVpsToCartButton({
  checkoutHref,
  planId,
  label,
  priceBrl,
  disabled,
  embedded,
  className,
}: {
  checkoutHref: string;
  planId: string;
  label: string;
  priceBrl: number;
  disabled?: boolean;
  embedded?: boolean;
  className?: string;
}) {
  const notify = useAddedToast();

  const add = () => {
    const query = checkoutHref.slice(checkoutHref.indexOf("?") + 1);
    notify(
      addVpsToCart({
        label,
        planId,
        priceBrl,
        query,
        summary: vpsCartSummary(new URLSearchParams(query)),
      }),
      `${label} adicionado ao carrinho.`
    );
  };

  return (
    <Button
      aria-label="Adicionar ao carrinho"
      className={cn(
        "h-9 w-9 shrink-0 rounded-xl p-0 md:h-14 md:w-14",
        embedded
          ? "border-border bg-transparent text-foreground hover:border-sky-500/50 hover:text-sky-500"
          : "border-white/20 bg-white/5 text-white hover:border-sky-500/50 hover:bg-sky-500/10 hover:text-sky-400",
        className
      )}
      disabled={disabled}
      onClick={add}
      title={
        disabled
          ? "Defina a senha do servidor para continuar"
          : "Adicionar ao carrinho"
      }
      type="button"
      variant="outline"
    >
      <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
    </Button>
  );
}
