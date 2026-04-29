"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExternalLink, MoreHorizontal, RefreshCw, Server } from "lucide-react";
import Link from "next/link";
import { RenewDomainModal } from "./RenewDomainModal";

interface DomainActionsMenuProps {
  domainId: string;
  domainName: string;
}

export function DomainActionsMenu({ domainId, domainName }: DomainActionsMenuProps) {
  const [isRenewOpen, setIsRenewOpen] = useState(false);

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 flex items-center justify-center shrink-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Ações para {domainName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href={`/dns?domain=${domainId}`}>
            <Server className="h-4 w-4 mr-2" /> Gerenciar DNS
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => setIsRenewOpen(true)}
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Renovar Domínio
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <a
            href={`http://${domainName}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4 mr-2" /> Visitar Site
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
