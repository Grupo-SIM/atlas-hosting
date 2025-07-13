import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUser } from "@/lib/auth";
import { getUserCurrentDomain } from "@/lib/server/utils";
import { Download, Globe, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { WordPressTransferForm } from "./components";

export default async function WordPressTransferPage() {
  const user = await getUser();
  const selectedDomain = await getUserCurrentDomain(user);
  const activeDomains = user.organization.domains.filter(
    (domain) => domain.active
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Transferir Site WordPress
          </h1>
          <p className="text-muted-foreground mt-1">
            Importe seu site WordPress existente usando o arquivo ZIP gerado
            pelo nosso plugin
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Download className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold">Importação Completa</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Importa todos os arquivos, temas, plugins e banco de dados
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-semibold">Processo Seguro</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Validação completa e backup automático antes da importação
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-semibold">Configuração Automática</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                SSL, DNS e configurações otimizadas automaticamente
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Instructions Card */}
        <Card className="border-border/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Como usar o plugin AtlasHosting Migrator
            </CardTitle>
            <CardDescription>
              Siga estes passos no seu site WordPress atual para gerar o arquivo
              de exportação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Instalar Plugin</h4>
                    <p className="text-sm text-muted-foreground">
                      Baixe e instale o plugin AtlasHosting Migrator no seu
                      WordPress
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Executar Exportação</h4>
                    <p className="text-sm text-muted-foreground">
                      Vá em AtlasHosting → Migrador e execute a exportação
                      completa
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Baixar Arquivo ZIP</h4>
                    <p className="text-sm text-muted-foreground">
                      Aguarde a conclusão e baixe o arquivo ZIP gerado
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold mt-0.5">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">Fazer Upload</h4>
                    <p className="text-sm text-muted-foreground">
                      Use o formulário abaixo para fazer upload do arquivo
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border/50">
              <Button variant="outline" size="sm" asChild>
                <Link href="/atlashosting-migrator.zip" target="_blank">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Plugin AtlasHosting Migrator
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transfer Form */}
        <WordPressTransferForm
          activeDomains={activeDomains}
          selectedDomain={selectedDomain}
          userEmail={user.email}
        />
      </div>
    </div>
  );
}
