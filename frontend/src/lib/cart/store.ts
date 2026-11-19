"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  CART_MAX_ITEMS,
  type CartItem,
  type DomainCartItem,
  type VpsCartItem,
} from "./types";

/**
 * Carrinho no localStorage: funciona deslogado na landing e é o mesmo dentro do
 * painel. Abas abertas se atualizam pelo evento `storage`.
 */
const STORAGE_KEY = "atlas-cart-v1";
const EMPTY: CartItem[] = [];

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedItems: CartItem[] = EMPTY;

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== "string" || typeof item.priceBrl !== "number")
    return false;
  if (item.kind === "domain")
    return typeof item.domain === "string" && typeof item.years === "number";
  if (item.kind === "vps")
    return (
      typeof item.planId === "string" &&
      typeof item.query === "string" &&
      typeof item.label === "string"
    );
  return false;
}

function readItems(): CartItem[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return cachedItems;
  }
  if (raw === cachedRaw) return cachedItems;
  cachedRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cachedItems = Array.isArray(parsed)
      ? parsed.filter(isCartItem).slice(0, CART_MAX_ITEMS)
      : EMPTY;
  } catch {
    cachedItems = EMPTY;
  }
  return cachedItems;
}

function writeItems(items: CartItem[]) {
  const raw = JSON.stringify(items);
  cachedRaw = raw;
  cachedItems = items;
  try {
    window.localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    // Sem storage (aba privada, bloqueio): o carrinho vale só nesta página.
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export type AddToCartResult = { ok: true } | { ok: false; error: string };

export function addDomainToCart(
  input: Omit<DomainCartItem, "id" | "kind">
): AddToCartResult {
  const items = readItems();
  const domain = input.domain.trim().toLowerCase();
  const existing = items.find(
    item => item.kind === "domain" && item.domain === domain
  );
  if (existing) {
    writeItems(
      items.map(item =>
        item === existing ? { ...existing, ...input, domain } : item
      )
    );
    return { ok: true };
  }
  if (items.length >= CART_MAX_ITEMS)
    return {
      error: `O carrinho aceita até ${CART_MAX_ITEMS} itens.`,
      ok: false,
    };
  writeItems([...items, { ...input, domain, id: newId(), kind: "domain" }]);
  return { ok: true };
}

export function addVpsToCart(
  input: Omit<VpsCartItem, "id" | "kind">
): AddToCartResult {
  const items = readItems();
  if (items.length >= CART_MAX_ITEMS)
    return {
      error: `O carrinho aceita até ${CART_MAX_ITEMS} itens.`,
      ok: false,
    };
  writeItems([...items, { ...input, id: newId(), kind: "vps" }]);
  return { ok: true };
}

export function removeFromCart(id: string) {
  writeItems(readItems().filter(item => item.id !== id));
}

export function removeDomainFromCart(domain: string) {
  const normalized = domain.trim().toLowerCase();
  writeItems(
    readItems().filter(
      item => !(item.kind === "domain" && item.domain === normalized)
    )
  );
}

export function clearCart() {
  writeItems(EMPTY);
}

export function useCartItems(): CartItem[] {
  return useSyncExternalStore(subscribe, readItems, () => EMPTY);
}

export function useDomainInCart(): (domain: string) => boolean {
  const items = useCartItems();
  return useCallback(
    (domain: string) => {
      const normalized = domain.trim().toLowerCase();
      return items.some(
        item => item.kind === "domain" && item.domain === normalized
      );
    },
    [items]
  );
}
