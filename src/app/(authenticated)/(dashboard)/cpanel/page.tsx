"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Files,
  FolderTree,
  HardDrive,
  Lock,
  Settings,
  Shield,
  Terminal,
  Upload,
  Users,
  Cpu,
  MemoryStick as Memory,
  Server,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function CpanelPage() {
  const [isRestarting, setIsRestarting] = useState(false);

  const handleServerRestart = () => {
    setIsRestarting(true);
    setTimeout(() => setIsRestarting(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Painel de Controle
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seu servidor e recursos
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleServerRestart}
            disabled={isRestarting}
          >
            {isRestarting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Reiniciando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reiniciar Servidor
              </>
            )}
          </Button>
          <Button>
            <Terminal className="mr-2 h-4 w-4" />
            Terminal SSH
          </Button>
        </div>
      </div>

      {/* Server Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Status do Servidor
            </CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold">Online</span>
            </div>
            <p className="text-xs text-muted-foreground">Uptime: 99.9%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12%</div>
            <Progress value={12} className="mt-2" />
            <p className="text-xs text-muted-foreground">Uso de CPU</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memória</CardTitle>
            <Memory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45%</div>
            <Progress value={45} className="mt-2" />
            <p className="text-xs text-muted-foreground">2.3GB / 5GB</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Armazenamento</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <Progress value={68} className="mt-2" />
            <p className="text-xs text-muted-foreground">6.8GB / 10GB</p>
          </CardContent>
        </Card>
      </div>

      {/* Management Tools */}
      <Tabs defaultValue="files" className="space-y-4">
        <TabsList>
          <TabsTrigger value="files">Arquivos</TabsTrigger>
          <TabsTrigger value="databases">Bancos de Dados</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Files className="h-5 w-5" />
                  Gerenciador de Arquivos
                </CardTitle>
                <CardDescription>
                  Gerencie arquivos e pastas do seu site
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload de Arquivos
                </CardTitle>
                <CardDescription>
                  Faça upload de arquivos para seu servidor
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderTree className="h-5 w-5" />
                  Backup
                </CardTitle>
                <CardDescription>
                  Crie e restaure backups dos seus dados
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="databases" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  MySQL Databases
                </CardTitle>
                <CardDescription>
                  Gerencie seus bancos de dados MySQL
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  phpMyAdmin
                </CardTitle>
                <CardDescription>
                  Interface web para administração MySQL
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  SSL/TLS
                </CardTitle>
                <CardDescription>Gerencie certificados SSL</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Proteção IP
                </CardTitle>
                <CardDescription>Bloqueie IPs maliciosos</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações PHP
                </CardTitle>
                <CardDescription>Ajuste configurações do PHP</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Usuários FTP
                </CardTitle>
                <CardDescription>Gerencie contas FTP</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
