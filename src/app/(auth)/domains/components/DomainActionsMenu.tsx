"use client";

import { ExternalLink, MoreHorizontal, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RenewDomainModal } from "./RenewDomainModal";

interface DomainActionsMenuProps {
  domainName: string;
}

export function DomainActionsMenu({ domainName }: DomainActionsMenuProps) {
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
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => setIsRenewOpen(true)}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Renovar Domínio
          </DropdownMenuItem>
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