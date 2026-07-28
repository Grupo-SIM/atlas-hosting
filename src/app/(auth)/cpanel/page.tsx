"use client";

import {
  CheckCircle,
  Cpu,
  Database,
  Files,
  FolderTree,
  HardDrive,
  Lock,
  MemoryStick as Memory,
  RefreshCw,
  Server,
  Settings,
  Shield,
  Terminal,
  Upload,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CpanelPage() {
  const [isRestarting, setIsRestarting] = useState(false);

  const handleServerRestart = () => {
    setIsRestarting(true);
    setTimeout(() => setIsRestarting(false), 2000);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight md:text-3xl">
            Painel de Controle
          </h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie seu servidor e recursos
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            disabled={isRestarting}
            onClick={handleServerRestart}
            variant="outline"
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Status do Servidor
            </CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="font-bold text-2xl">Online</span>
            </div>
            <p className="text-muted-foreground text-xs">Uptime: 99.9%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">CPU</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">12%</div>
            <Progress className="mt-2" value={12} />
            <p className="text-muted-foreground text-xs">Uso de CPU</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Memória</CardTitle>
            <Memory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">45%</div>
            <Progress className="mt-2" value={45} />
            <p className="text-muted-foreground text-xs">2.3GB / 5GB</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Armazenamento</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">68%</div>
            <Progress className="mt-2" value={68} />
            <p className="text-muted-foreground text-xs">6.8GB / 10GB</p>
          </CardContent>
        </Card>
      </div>

      {/* Management Tools */}
      <Tabs className="space-y-4" defaultValue="files">
        <TabsList>
          <TabsTrigger value="files">Arquivos</TabsTrigger>
          <TabsTrigger value="databases">Bancos de Dados</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-4" value="files">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
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

            <Card className="cursor-pointer transition-shadow hover:shadow-md">
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

            <Card className="cursor-pointer transition-shadow hover:shadow-md">
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

        <TabsContent className="space-y-4" value="databases">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
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

            <Card className="cursor-pointer transition-shadow hover:shadow-md">
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

        <TabsContent className="space-y-4" value="security">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  SSL/TLS
                </CardTitle>
                <CardDescription>Gerencie certificados SSL</CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer transition-shadow hover:shadow-md">
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

        <TabsContent className="space-y-4" value="settings">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações PHP
                </CardTitle>
                <CardDescription>Ajuste configurações do PHP</CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer transition-shadow hover:shadow-md">
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
