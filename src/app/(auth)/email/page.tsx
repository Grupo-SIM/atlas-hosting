import { getMailAccounts } from "@/lib/server/apis/email/client";
import { createEmailAccountAction, deleteEmailAccountAction } from "./actions";
import { getUserCurrentDomain, getUserDomains } from "@/lib/server/utils";
import type { MailName } from "@/lib/server/apis/email/types";
import { getUser } from "@/lib/auth";
import DomainSelector from "@/components/domains/DomainSelector";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge"; // Not used in the final layout but good to have if needed
import { Mail, Plus, Check } from "lucide-react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

// Ensure ListDomainDomain is imported if selectedDomain relies on its specific properties not covered by a general object type
// import type { ListDomainDomain } from "@/lib/server/apis/namesilo/types";

// A simple client component for the delete button to avoid full page reload on confirm
// You could also use a form for deletion.
const DeleteButton = ({ mailNameId }: { mailNameId: number }) => {
  // This component would ideally be in its own file e.g. src/components/email/DeleteButton.tsx
  // For simplicity, it's inline here.
  // To make it a client component, you'd add "use client" at the top of its file.
  // And then handle the form submission with startTransition for pending states.
  return (
    <form
      action={async () => {
        if (confirm("Tem certeza que deseja excluir esta conta de e-mail?")) {
          await deleteEmailAccountAction(mailNameId);
        }
      }}
    >
      <button type="submit" className="text-red-500 hover:text-red-700">
        Excluir
      </button>
    </form>
  );
};

export default async function EmailPage() {
  const user = await getUser();

  const domains = await getUserDomains(user.id);
  const selectedDomain = await getUserCurrentDomain(user);

  if (!selectedDomain) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Nenhum domínio selecionado</h1>
        <p>
          Por favor, selecione um domínio para gerenciar as contas de e-mail.
        </p>
      </div>
    );
  }

  let mailAccounts: MailName[] = [];
  let error: string | null = null;

  if (!user.pleskId) {
    notFound();
  }

  try {
    // Use selectedDomain.ID for fetching mail accounts specific to this domain
    mailAccounts = await getMailAccounts(+user.pleskId);
  } catch (e) {
    console.error("Erro ao buscar contas de e-mail:", e);
    error =
      e instanceof Error
        ? e.message
        : "Não foi possível carregar as contas de e-mail. Tente novamente mais tarde.";
  }

  // Mocked data from example
  const expiryDate = "2027-02-12"; // Mocked
  const plan = "Hostinger Free"; // Mocked

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            E-mails
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas contas de e-mail para o domínio{" "}
            <span className="font-semibold">{selectedDomain.Name}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DomainSelector domains={domains} selectedDomain={selectedDomain} />
          <Button variant="outline">Comprar um plano</Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Comprar uma caixa de e-mail
          </Button>
        </div>
      </div>

      {/* Domain Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{selectedDomain.Name}</h2>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                <span className="text-sm text-muted-foreground">
                  Expira em: {expiryDate}
                </span>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  •
                </span>
                <span className="text-sm text-muted-foreground">
                  Plano de e-mail: {plan}
                </span>
                <Button variant="link" className="text-sm p-0 h-auto">
                  Ver limites
                </Button>
              </div>
            </div>
            <Button>Fazer Upgrade</Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="text-red-500 bg-red-100 p-3 rounded mb-4">{error}</p>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Email Boxes */}
        <Card>
          <CardHeader>
            <CardTitle>Caixas de e-mail</CardTitle>
            <CardDescription>
              Crie e gerencie suas contas de e-mail @{selectedDomain.Name}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mailAccounts.length === 0 && !error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Mail className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  Crie sua primeira conta de e-mail
                </h3>
                <p className="text-muted-foreground mb-6">
                  Crie uma conta e-mail com @{selectedDomain.Name} para começar
                  a enviar e receber e-mails.
                </p>
                {/* The form below will serve as the creation mechanism */}
              </div>
            ) : null}

            {mailAccounts.length > 0 && (
              <Table className="mb-6">
                <TableHeader>
                  <TableRow>
                    <TableHead>Endereço de E-mail</TableHead>
                    <TableHead>Cota</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mailAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">
                        {account.name}@
                        {account.site_name || selectedDomain.Name}
                      </TableCell>
                      <TableCell>
                        {account.mailbox
                          ? account.mailbox.quota === -1
                            ? "Ilimitada"
                            : `${(account.mailbox.quota || 0) / 1024 / 1024} MB`
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DeleteButton mailNameId={account.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Create New Email Account Form */}
            <h3 className="text-lg font-medium mb-3 border-t pt-4">
              Criar Nova Conta de E-mail
            </h3>
            <form action={createEmailAccountAction} className="space-y-3">
              <div>
                <label
                  htmlFor="mailName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nome de Usuário (ex: info):
                </label>
                <input
                  type="text"
                  name="mailName"
                  id="mailName"
                  required={true}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Senha:
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  required={true}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="quota"
                  className="block text-sm font-medium text-gray-700"
                >
                  Cota (MB, deixe em branco para ilimitado):
                </label>
                <input
                  type="number"
                  name="quota"
                  id="quota"
                  min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                Criar Conta
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Domain Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Configurações de domínio</CardTitle>
            <Button variant="outline" size="sm">
              Gerenciar
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {[
              {
                title: "Capacidade de receber emails",
                subtitle: "MX registros",
                status: true,
              },
              {
                title: "Proteja sua reputação de e-mail",
                subtitle: "SPF registros",
                status: true,
              },
              {
                title: "Aumente a entregabilidade de e-mail",
                subtitle: "DKIM registros",
                status: true,
              },
              {
                title: "Autenticação de mensagem",
                subtitle: "DMARC registros",
                status: true,
              },
            ].map((item, index) => (
              <div
                key={JSON.stringify(item).concat(index.toString())}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.subtitle}
                  </p>
                </div>
                {item.status ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Mail className="h-5 w-5 text-destructive" /> // Example for a 'false' status
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
