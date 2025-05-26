"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  ArrowRight,
  Check,
  Mail,
  MoreHorizontal,
  Plus,
  Settings,
  Trash2,
} from "lucide-react";
import { useState } from "react";

export default function EmailPage() {
  const domain = "example.com";
  const expiryDate = "2027-02-12";
  const plan = "Atlas Hosting Pro";

  const [emailAccounts] = useState([
    {
      email: "admin@example.com",
      quota: "1GB",
      used: "234MB",
      status: "active",
    },
    {
      email: "contact@example.com",
      quota: "500MB",
      used: "45MB",
      status: "active",
    },
  ]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            E-mails
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas contas de e-mail
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Comprar um plano</Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova conta de e-mail
          </Button>
        </div>
      </div>

      {/* Domain Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{domain}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">
                  Expira em: {expiryDate}
                </span>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  Plano de e-mail: {plan}
                </span>
                <Button variant="link" className="text-sm p-0 h-auto">
                  Alterar plano
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Check className="h-3 w-3" />
              Ativo
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Email Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Contas de E-mail
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emailAccounts.length}</div>
            <p className="text-xs text-muted-foreground">De 10 disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Armazenamento Usado
            </CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">279MB</div>
            <p className="text-xs text-muted-foreground">De 5GB disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Ativo</div>
            <p className="text-xs text-muted-foreground">
              Todas as contas funcionando
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Email Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contas de E-mail</CardTitle>
          <CardDescription>
            Gerencie suas contas de e-mail para {domain}
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              {emailAccounts.map((account, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <span>{account.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{account.quota}</TableCell>
                  <TableCell>{account.used}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        account.status === "active" ? "default" : "secondary"
                      }
                    >
                      {account.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          Configurações
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Webmail
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
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
        </CardContent>
      </Card>

      {/* Quick Setup Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração Rápida</CardTitle>
          <CardDescription>
            Configure seu cliente de e-mail preferido
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Servidor de Entrada (IMAP)</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Servidor: mail.{domain}</p>
                <p>Porta: 993</p>
                <p>Segurança: SSL/TLS</p>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Servidor de Saída (SMTP)</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Servidor: mail.{domain}</p>
                <p>Porta: 465</p>
                <p>Segurança: SSL/TLS</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
