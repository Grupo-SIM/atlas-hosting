"use client";

import { useState, type ReactNode } from "react";
import NoDomains from "@/components/domains/NoDomains";
import { DomainListContext } from "./domain-list-context";

export function DomainList({ children, domainIds }: { children: ReactNode; domainIds: string[] }) {
  const [deletedIds, setDeletedIds] = useState<Set<string>>(() => new Set());

  return (
    <DomainListContext.Provider value={{
      deletedIds,
      removeDomain: id => setDeletedIds(previous => new Set([...previous, id])),
    }}>
      {domainIds.some(id => !deletedIds.has(id)) ? children : <NoDomains />}
    </DomainListContext.Provider>
  );
}
