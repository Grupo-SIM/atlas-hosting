"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Mail, MoreHorizontal, Settings, Trash2 } from "lucide-react";
import type { ZohoEmailAccountResponse } from "@/lib/server/apis/zoho";

interface EmailAccountsTableProps {
  accounts: ZohoEmailAccountResponse[];
  onEditAccount: (account: ZohoEmailAccountResponse) => void;
  onDeleteAccount: (account: ZohoEmailAccountResponse) => void;
  onOpenWebmail: (account: ZohoEmailAccountResponse) => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) { return "0 B"; }
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

export function EmailAccountsTable({
  accounts,
  onEditAccount,
  onDeleteAccount,
  onOpenWebmail,
}: EmailAccountsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Endereço de E-mail</TableHead>
          <TableHead>Quota</TableHead>
          <TableHead>Usado</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts.map((account, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <span>{account.emailAddress}</span>
              </div>
            </TableCell>
            <TableCell>{formatBytes(account.quota * 1024 * 1024)}</TableCell>
            <TableCell>{formatBytes(account.used * 1024 * 1024)}</TableCell>
            <TableCell>
              <Badge
                variant={account.status === "active" ? "default" : "secondary"}
              >
                {account.status === "active" ? "Ativo" : "Inativo"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild={true}>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEditAccount(account)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onOpenWebmail(account)}>
                    <Mail className="mr-2 h-4 w-4" />
                    Webmail
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => onDeleteAccount(account)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
