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
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowUpCircle,
  CheckCircle,
  ExternalLink,
  FileText,
  Globe,
  Lock,
  MoreHorizontal,
  Package,
  Plus,
  RefreshCw,
  Settings,
  Shield,
} from "lucide-react";
import { useState } from "react";

export default function WordPressPage() {
  const [isUpdating, setIsUpdating] = useState(false);

  const sites = [
    {
      domain: "example.com",
      createdAt: "2024-03-04",
      status: "active",
      resources: {
        storage: { used: 2.1, total: 10 },
        bandwidth: { used: 15, total: 100 },
      },
    },
  ];

  const handleUpdate = () => {
    setIsUpdating(true);
    setTimeout(() => setIsUpdating(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            WordPress
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas instalações WordPress
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleUpdate}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Atualizando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Verificar Atualizações
              </>
            )}
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Instalação
          </Button>
        </div>
      </div>

      {/* WordPress Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sites Ativos</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">WordPress instalado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atualizações</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plugins</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Instalados</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suas Instalações WordPress</CardTitle>
          <CardDescription>
            Gerencie todas as suas instalações WordPress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domínio</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recursos</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.map((site, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Globe className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{site.domain}</div>
                        <div className="text-sm text-muted-foreground">
                          WordPress 6.4.2
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        site.status === "active" ? "default" : "secondary"
                      }
                    >
                      <CheckCircle className="mr-1 h-3 w-3" />
                      {site.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Armazenamento</span>
                        <span>
                          {site.resources.storage.used}GB /{" "}
                          {site.resources.storage.total}GB
                        </span>
                      </div>
                      <Progress
                        value={
                          (site.resources.storage.used /
                            site.resources.storage.total) *
                          100
                        }
                        className="h-1"
                      />

                      <div className="flex items-center justify-between text-sm">
                        <span>Largura de Banda</span>
                        <span>
                          {site.resources.bandwidth.used}GB /{" "}
                          {site.resources.bandwidth.total}GB
                        </span>
                      </div>
                      <Progress
                        value={
                          (site.resources.bandwidth.used /
                            site.resources.bandwidth.total) *
                          100
                        }
                        className="h-1"
                      />
                    </div>
                  </TableCell>
                  <TableCell>{site.createdAt}</TableCell>
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
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Visitar Site
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          Admin WordPress
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          Logs
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Shield className="mr-2 h-4 w-4" />
                          Backup
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <Plus className="h-8 w-8 mx-auto text-primary" />
            <CardTitle className="text-lg">Nova Instalação</CardTitle>
            <CardDescription>
              Instale o WordPress em um novo domínio
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <Package className="h-8 w-8 mx-auto text-primary" />
            <CardTitle className="text-lg">Gerenciar Plugins</CardTitle>
            <CardDescription>Instale e configure plugins</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <Shield className="h-8 w-8 mx-auto text-primary" />
            <CardTitle className="text-lg">Backup Automático</CardTitle>
            <CardDescription>Configure backups automáticos</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <Lock className="h-8 w-8 mx-auto text-primary" />
            <CardTitle className="text-lg">SSL Gratuito</CardTitle>
            <CardDescription>Ative certificado SSL/TLS</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
