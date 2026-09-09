"use client";

import {
  ArrowRightLeft,
  ExternalLink,
  MoreHorizontal,
  RefreshCw,
  Server,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RenewDomainModal } from "./RenewDomainModal";
import { DomainTransferDialog } from "./DomainTransferDialog";

interface DomainActionsMenuProps {
  canTransfer: boolean;
  domainId: string;
  domainName: string;
}

export function DomainActionsMenu({
  canTransfer,
  domainId,
  domainName,
}: DomainActionsMenuProps) {
  const [isRenewOpen, setIsRenewOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="flex h-8 w-8 shrink-0 items-center justify-center"
            size="icon"
            variant="ghost"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Ações para {domainName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href={`/domains/${domainId}`}>
              <Server className="mr-2 h-4 w-4" /> Detalhes e DNS
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => setIsRenewOpen(true)}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Renovar Domínio
          </DropdownMenuItem>
          {canTransfer && (
            <DomainTransferDialog
              domainId={domainId}
              domainName={domainName}
              trigger={
                <DropdownMenuItem className="cursor-pointer">
                  <ArrowRightLeft className="mr-2 h-4 w-4" /> Transferir domínio
                </DropdownMenuItem>
              }
            />
          )}
          <DropdownMenuItem asChild className="cursor-pointer">
            <a
              href={`http://${domainName}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              <ExternalLink className="mr-2 h-4 w-4" /> Visitar Site
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {isRenewOpen && (
        <RenewDomainModal
          domainName={domainName}
          onClose={() => setIsRenewOpen(false)}
        />
      )}
    </>
  );
}
