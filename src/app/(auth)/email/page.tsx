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
import { HardDrive, Mail, RefreshCw, Server, Shield } from "lucide-react";
import { revalidatePath } from "next/cache";
import { getPleskMailAccounts, reloadEmailAccounts } from "./actions";
import { PleskEmailClient } from "./components/PleskEmailClient";
import { CreateEmailAccountDialog } from "./components/CreateEmailAccountDialog";
import Form from "next/form";

export default async function EmailPage() {
  const user = await getUser();

  // Get user's currently selected domain for email management
  const selectedDomain = await getUserCurrentDomain(user);

  // Transform the selected domain to match the expected interface
  const domains = selectedDomain
    ? [
        {
          id: selectedDomain.id,
          name: selectedDomain.domain,
          pleskId: undefined,
          pleskSiteId: undefined,
          status: selectedDomain.active ? "active" : "inactive",
        },
      ]
    : [];

  // Get Plesk mail accounts
  const mailAccountsResult = await getPleskMailAccounts();
  const mailAccounts = mailAccountsResult.success
    ? mailAccountsResult.data
    : [];
  const hasError = !mailAccountsResult.success;

  if (!selectedDomain) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              E-mail Profissional
            </h1>
            <p className="text-muted-foreground mt-1">
              Acesse e gerencie suas contas de e-mail com integração Plesk
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Nenhum Domínio Selecionado
            </CardTitle>
            <CardDescription>
              Para gerenciar e-mails, você precisa selecionar um domínio
              primeiro.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Use o seletor de domínio no topo da página para escolher um
              domínio configurado para hospedagem.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              E-mail Profissional
            </h1>
            <p className="text-muted-foreground mt-1">
              Acesse e gerencie suas contas de e-mail com integração Plesk
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-red-500" />
              Erro na Configuração
            </CardTitle>
            <CardDescription>
              {mailAccountsResult.error ||
                "Erro ao carregar as configurações de e-mail do Plesk"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              O domínio <strong>{selectedDomain.domain}</strong> pode não estar
              configurado para hospedagem no Plesk ou pode haver um problema de
              conectividade.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            E-mail Profissional
          </h1>
          <p className="text-muted-foreground mt-1">
            Acesse e gerencie suas contas de e-mail com integração Plesk
          </p>
        </div>
      </div>

      {(mailAccounts ?? []).length === 0 ? (
        <div className="space-y-6">
          {/* Info Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Server className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Configuração Rápida</CardTitle>
                <CardDescription>
                  Configure uma conta de e-mail em poucos cliques para o domínio{" "}
                  <strong>{selectedDomain.domain}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Form action="">
                    <CreateEmailAccountDialog
                      domainName={selectedDomain.domain}
                    />
                  </Form>
                  <form action={reloadEmailAccounts}>
                    <Button type="submit" variant="outline" className="w-full">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Recarregar Contas
                    </Button>
                  </form>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Crie uma nova conta ou recarregue se já criou uma
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Segurança Avançada</CardTitle>
                <CardDescription>
                  Proteção anti-spam e antivírus integrada ao Plesk
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                  <HardDrive className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>IMAP & SMTP Real</CardTitle>
                <CardDescription>
                  Acesso completo aos seus e-mails via IMAP e envio via SMTP
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Status da Integração E-mail
              </CardTitle>
              <CardDescription>
                Domínio selecionado: <strong>{selectedDomain.domain}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-300">
                      Plesk XML API
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Gerenciamento de contas ativo
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-300">
                      IMAP/SMTP
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Acesso real aos e-mails
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                ✨ <strong>Nova funcionalidade:</strong> Agora com acesso real
                aos e-mails! Não há mais dados simulados - você verá seus
                e-mails reais assim que criar uma conta.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <PleskEmailClient
          user={user}
          domains={domains}
          initialMailAccounts={mailAccounts}
        />
      )}
    </div>
  );
}
