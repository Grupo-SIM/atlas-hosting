"use client";

import { createContext, useContext } from "react";

export const DomainListContext = createContext<{
  deletedIds: Set<string>;
  removeDomain: (id: string) => void;
} | null>(null);

export function useDomainList() {
  const context = useContext(DomainListContext);
  if (!context) throw new Error("Domain list components require DomainList.");
  return context;
}
