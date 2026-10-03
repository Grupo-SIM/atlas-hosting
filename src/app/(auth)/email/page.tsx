import { HardDrive, Mail, RefreshCw, Server, Shield } from "lucide-react";
import Form from "next/form";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUser } from "@/lib/auth";
import pleskApi from "@/lib/server/apis/plesk";
import { activateMailForSite } from "@/lib/server/apis/plesk-xml/client";
import { getUserCurrentDomain } from "@/lib/server/utils";
import { getPleskMailAccounts, reloadEmailAccounts } from "./actions";
import { CreateEmailAccountDialog } from "./components/CreateEmailAccountDialog";
import {
  PleskEmailClient,
  type PleskEmailSearchParams,
} from "./components/PleskEmailClient";

export default async function EmailPage({
  searchParams,
}: {
  searchParams: Promise<PleskEmailSearchParams>;
}) {
  const user = await getUser();

  // Get user's currently selected domain for email management
  const selectedDomain = await getUserCurrentDomain(user);

  if (!selectedDomain) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-2xl tracking-tight md:text-3xl">
              E-mail Profissional
            </h1>
            <p className="mt-1 text-muted-foreground">
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
            <p className="text-muted-foreground text-sm">
              Cadastre um domínio e configure sua hospedagem para gerenciar
              suas contas de e-mail.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  const site = await pleskApi.getDomain(selectedDomain?.domain ?? "");

  if (!site || !selectedDomain.active) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-2xl tracking-tight md:text-3xl">
              E-mail Profissional
            </h1>
            <p className="mt-1 text-muted-foreground">
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
              O domínio selecionado não está configurado corretamente no Plesk.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground text-sm">
              Verifique se o domínio <strong>{selectedDomain.domain}</strong>{" "}
              está ativo e configurado para hospedagem no Plesk.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  await activateMailForSite(site.id);

  // Get Plesk mail accounts
  const mailAccountsResult = await getPleskMailAccounts();
  console.log(mailAccountsResult);
  const mailAccounts = mailAccountsResult.success
    ? mailAccountsResult.data
    : [];
  const hasError = !mailAccountsResult.success;

  if (hasError) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-2xl tracking-tight md:text-3xl">
              E-mail Profissional
            </h1>
            <p className="mt-1 text-muted-foreground">
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
            <p className="mb-4 text-muted-foreground text-sm">
              O domínio <strong>{selectedDomain.domain}</strong> pode não estar
              configurado para hospedagem no Plesk ou pode haver um problema de
              conectividade.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight md:text-3xl">
            E-mail Profissional
          </h1>
          <p className="mt-1 text-muted-foreground">
            Acesse e gerencie suas contas de e-mail com integração Plesk
          </p>
        </div>
      </div>

      {(mailAccounts ?? []).length === 0 ? (
        <div className="space-y-6">
          {/* Info Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-2 border-primary/20 border-dashed transition-colors hover:border-primary/40">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
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
                    <Button className="w-full" type="submit" variant="outline">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Recarregar Contas
                    </Button>
                  </form>
                </div>
                <p className="mt-3 text-center text-muted-foreground text-xs">
                  Crie uma nova conta ou recarregue se já criou uma
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
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
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
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
                <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-300">
                      Plesk XML API
                    </p>
                    <p className="text-green-600 text-sm dark:text-green-400">
                      Gerenciamento de contas ativo
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-300">
                      IMAP/SMTP
                    </p>
                    <p className="text-green-600 text-sm dark:text-green-400">
                      Acesso real aos e-mails
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-sm">
                ✨ <strong>Nova funcionalidade:</strong> Agora com acesso real
                aos e-mails! Não há mais dados simulados - você verá seus
                e-mails reais assim que criar uma conta.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Suspense>
          <PleskEmailClient
            domains={domains}
            initialMailAccounts={mailAccounts}
            searchParams={searchParams}
            user={user}
          />
        </Suspense>
      )}
    </div>
  );
}
