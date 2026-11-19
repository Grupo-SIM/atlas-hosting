/** Itens do carrinho guardados no navegador (landing e painel compartilham o mesmo carrinho). */

export const CART_MAX_ITEMS = 10;

export interface DomainCartItem {
  id: string;
  kind: "domain";
  domain: string;
  years: number;
  /** Estimativa exibida no carrinho; o servidor recalcula ao fechar o pedido. */
  priceBrl: number;
}

export interface VpsCartItem {
  id: string;
  kind: "vps";
  planId: string;
  label: string;
  /** Ex.: "24 meses · 1 unidade". */
  summary: string;
  /** Mesma query que a tela de configuração manda para `/checkout/personal-data`. */
  query: string;
  /** Estimativa exibida no carrinho; o servidor recalcula ao fechar o pedido. */
  priceBrl: number;
}

export type CartItem = DomainCartItem | VpsCartItem;

/** Item enviado ao servidor para fechar o pedido (sem os campos só de exibição). */
export type CartCheckoutItem =
  | { kind: "domain"; domain: string; years: number }
  | { kind: "vps"; planId: string; query: string; label?: string };

export function toCheckoutItems(items: CartItem[]): CartCheckoutItem[] {
  return items.map(item =>
    item.kind === "domain"
      ? { domain: item.domain, kind: "domain", years: item.years }
      : {
          kind: "vps",
          label: item.label,
          planId: item.planId,
          query: item.query,
        }
  );
}
