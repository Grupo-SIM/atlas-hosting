"use client";

import type { ComponentProps } from "react";
import { TableRow } from "@/components/ui/table";
import { useDomainList } from "./domain-list-context";

export function DomainTableRow({ domainId, ...props }: ComponentProps<typeof TableRow> & { domainId: string }) {
  const { deletedIds } = useDomainList();
  return deletedIds.has(domainId) ? null : <TableRow {...props} />;
}
