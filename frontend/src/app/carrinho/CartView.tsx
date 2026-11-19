"use client";

import {
  ArrowLeft,
  Globe,
  Loader2,
  Server,
  ShieldCheck,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { checkoutCart } from "@/app/cart-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { clearCart, removeFromCart, useCartItems } from "@/lib/cart/store";
import { toCheckoutItems } from "@/lib/cart/types";
import { toBrl } from "@/lib/utils";

const roboto = "[font-family:var(--font-roboto)]";
const CART_PATH = "/carrinho";

export function CartView({ isAuthenticated }: { isAuthenticated: boolean }) {
  const router = useRouter();
  const items = useCartItems();
  const [mounted, setMounted] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // O carrinho mora no navegador: antes de montar, o servidor não sabe o que há nele.
  useEffect(() => setMounted(true), []);

  const total = items.reduce((sum, item) => sum + item.priceBrl, 0);
  const domainCount = items.filter(item => item.kind === "domain").length;
  const vpsCount = items.length - domainCount;

  const finish = () => {
    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }
    startTransition(async () => {
      const result = await checkoutCart(toCheckoutItems(items));
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      // Os itens viraram um pedido (fica em Faturas se o pagamento não for concluído agora).
      clearCart();
      router.push(result.redirectUrl);
    });
  };

  const searchDomainHref = isAuthenticated ? "/domain" : "/domains/search";
  const serversHref = isAuthenticated ? "/vps-plans" : "/vps";

  return (
    <>
      <Link
        className="mb-8 inline-flex items-center gap-2 text-slate-400 text-sm transition-colors hover:text-sky-400"
        href={isAuthenticated ? "/home" : "/"}
      >
        <ArrowLeft className="h-4 w-4" />
        {isAuthenticated ? "Voltar ao painel" : "Voltar ao início"}
      </Link>

      <header className="mb-10 md:mb-12">
        <h1
          className={`${roboto} font-black text-3xl text-white uppercase tracking-tight md:text-4xl`}
        >
          Seu <span className="text-sky-500">carrinho</span>
        </h1>
        <p className="mt-3 text-base text-slate-400 md:text-lg">
          Domínios e servidores num único pagamento.
        </p>
      </header>

      {!mounted ? (
        <div className="flex items-center justify-center rounded-2xl border border-white/12 bg-[#0d1225] py-20">
          <Loader2 className="h-6 w-6 animate-spin text-sky-400" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-white/12 bg-[#0d1225] px-6 py-16 text-center shadow-[0_16px_48px_rgba(0,0,0,0.35)]">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-sky-500/30 bg-sky-500/10">
            <ShoppingCart className="h-6 w-6 text-sky-400" />
          </div>
          <p className={`${roboto} font-bold text-white text-xl`}>
            Seu carrinho está vazio
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/60">
            Adicione domínios e servidores e pague tudo de uma vez.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              asChild
              className={`${roboto} h-11 rounded-xl bg-sky-500 px-6 font-bold text-sm text-white uppercase tracking-wide hover:bg-sky-400`}
            >
              <Link href={searchDomainHref}>Buscar domínio</Link>
            </Button>
            <Button
              asChild
              className={`${roboto} h-11 rounded-xl border-white/25 bg-transparent px-6 font-bold text-sm text-white uppercase tracking-wide hover:border-sky-500/50 hover:bg-sky-500/10 hover:text-sky-400`}
              variant="outline"
            >
              <Link href={serversHref}>Ver servidores</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          <section className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="font-medium text-slate-400 text-sm">
                {items.length} {items.length === 1 ? "item" : "itens"}
              </p>
              <button
                className="font-bold text-slate-400 text-xs uppercase tracking-wide transition-colors hover:text-red-400"
                onClick={clearCart}
                type="button"
              >
                Esvaziar carrinho
              </button>
            </div>

            <ul className="divide-y divide-white/10 rounded-2xl border border-white/12 bg-[#0d1225] shadow-[0_16px_48px_rgba(0,0,0,0.35)]">
              {items.map(item => (
                <li
                  className="flex items-center gap-4 px-4 py-5 sm:px-6"
                  key={item.id}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/10">
                    {item.kind === "domain" ? (
                      <Globe className="h-5 w-5 text-sky-400" />
                    ) : (
                      <Server className="h-5 w-5 text-sky-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`${roboto} break-all font-bold text-base text-white md:text-lg`}
                    >
                      {item.kind === "domain" ? item.domain : item.label}
                    </p>
                    <p className="mt-0.5 text-white/45 text-xs">
                      {item.kind === "domain"
                        ? `Registro por ${item.years} ${item.years === 1 ? "ano" : "anos"} · Proteção WHOIS grátis`
                        : item.summary}
                    </p>
                  </div>
                  <p
                    className={`${roboto} shrink-0 font-bold text-base text-white md:text-lg`}
                  >
                    {toBrl(item.priceBrl)}
                  </p>
                  <button
                    aria-label={`Remover ${item.kind === "domain" ? item.domain : item.label}`}
                    className="shrink-0 rounded-lg p-2 text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-400"
                    onClick={() => removeFromCart(item.id)}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <Link
                className="font-medium text-sky-400 transition-colors hover:text-sky-300"
                href={searchDomainHref}
              >
                + Adicionar domínio
              </Link>
              <Link
                className="font-medium text-sky-400 transition-colors hover:text-sky-300"
                href={serversHref}
              >
                + Adicionar servidor
              </Link>
            </div>
          </section>

          <aside>
            <div className="rounded-2xl border border-white/12 bg-[#0d1225] p-6 shadow-[0_16px_48px_rgba(0,0,0,0.35)] lg:sticky lg:top-28">
              <h2
                className={`${roboto} font-bold text-sm text-white uppercase tracking-widest`}
              >
                Resumo
              </h2>
              <div className="mt-5 space-y-2 text-sm">
                {domainCount > 0 ? (
                  <div className="flex justify-between text-white/65">
                    <span>
                      {domainCount} {domainCount === 1 ? "domínio" : "domínios"}
                    </span>
                  </div>
                ) : null}
                {vpsCount > 0 ? (
                  <div className="flex justify-between text-white/65">
                    <span>
                      {vpsCount} {vpsCount === 1 ? "servidor" : "servidores"}
                    </span>
                  </div>
                ) : null}
              </div>
              <div className="mt-5 flex items-end justify-between border-white/10 border-t pt-5">
                <span className="font-medium text-white/45 text-xs uppercase tracking-wide">
                  Total estimado
                </span>
                <span className={`${roboto} font-bold text-2xl text-white`}>
                  {toBrl(total)}
                </span>
              </div>
              <p className="mt-2 text-white/45 text-xs leading-relaxed">
                O valor final é confirmado na tela de pagamento. Taxas de cartão
                ou boleto aparecem lá.
              </p>

              <Button
                className={`${roboto} mt-6 h-12 w-full rounded-xl bg-sky-500 font-bold text-sm text-white uppercase tracking-wide shadow-[0_8px_24px_rgba(14,165,233,0.25)] transition-all hover:bg-sky-400 active:scale-[0.98]`}
                disabled={isPending}
                onClick={finish}
                type="button"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gerando pedido…
                  </>
                ) : (
                  "Finalizar compra"
                )}
              </Button>

              <p className="mt-4 flex items-center gap-2 text-white/45 text-xs">
                <ShieldCheck className="h-4 w-4 shrink-0 text-sky-400" />
                Um único pagamento por cartão, PIX ou boleto.
              </p>
            </div>
          </aside>
        </div>
      )}

      <Dialog onOpenChange={setAuthOpen} open={authOpen}>
        <DialogContent className="border-white/10 bg-[#0d1225] text-white sm:max-w-md [&_.text-muted-foreground]:text-white/65 [&_button.absolute]:text-white/80">
          <DialogHeader>
            <DialogTitle className={`${roboto} text-white text-xl`}>
              Continuar compra
            </DialogTitle>
            <DialogDescription className="text-base text-white/70">
              Você já possui conta na Atlas Hosting? Seu carrinho fica salvo
              enquanto você entra.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <Button
              asChild
              className={`${roboto} h-11 w-full bg-sky-500 font-bold text-white uppercase tracking-wide transition-all hover:bg-sky-400`}
            >
              <Link href={`/login?redirect=${encodeURIComponent(CART_PATH)}`}>
                Sim — entrar com minha conta
              </Link>
            </Button>
            <Button
              asChild
              className={`${roboto} h-11 w-full border-white/25 bg-transparent font-bold text-white uppercase tracking-wide transition-all hover:border-sky-500/50 hover:bg-sky-500/10 hover:text-sky-400`}
              variant="outline"
            >
              <Link href={`/signup?redirect=${encodeURIComponent(CART_PATH)}`}>
                Não — criar conta nova
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
