// @ts-nocheck
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MailName } from "@/lib/server/apis/plesk-xml/types";
import {
  Archive,
  HardDrive,
  Inbox,
  Mail,
  Plus,
  Send,
  Server,
  Shield,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import {
  deleteEmail,
  getEmailAccountSettings,
  getEmailMessages,
  markEmailAsRead,
  sendEmail,
} from "../actions";
import { PleskEmailAccountSetup } from "./PleskEmailAccountSetup";
import { PleskEmailCompose } from "./PleskEmailCompose";
import { PleskEmailList } from "./PleskEmailList";
import { PleskEmailSidebar } from "./PleskEmailSidebar";
import { PleskEmailView } from "./PleskEmailView";
import type { User } from "@/lib/db/schema";

export async function PleskEmailClient({
  user,
  domains,
  initialMailAccounts = [],
  searchParams: _searchParams,
}: PleskEmailClientProps) {
  const searchParams = await _searchParams;

  const currentAccountId =
    searchParams.accountId || initialMailAccounts[0]?.id.toString();
  const activeAccount = initialMailAccounts.find(
    (acc) => acc.id.toString() === currentAccountId
  );

  if (!activeAccount) {
    return (
      <Card className="m-6">
        <CardHeader>
          <CardTitle>Configuração de Conta Necessária</CardTitle>
          <CardDescription>
            Por favor, selecione uma conta de e-mail válida ou configure uma
            nova para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/email?action=setupAccount">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Configurar Nova Conta
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const selectedFolder = searchParams.folder || "inbox";
  const selectedEmailId = searchParams.emailId;
  const action = searchParams.action;
  const replyToEmailId = searchParams.replyTo;

  let emails: EmailMessage[] = [];
  let selectedEmailData: EmailMessage | null = null;
  let replyToEmailData: EmailMessage | null = null;

  let accountConfig: AccountConfig | null = null;

  const accountConfigsResult = await getEmailAccountSettings();
  if (accountConfigsResult.success && accountConfigsResult.data) {
    accountConfig =
      accountConfigsResult.data.find(
        (config) =>
          config.emailAddress ===
          `${activeAccount.name}@${activeAccount.site_name}`
      ) ?? null;
  } else {
    console.error(
      "Failed to get account settings:",
      accountConfigsResult.error
    );
  }

  if (activeAccount && accountConfig) {
    const result = await getEmailMessages(
      accountConfig.id,
      selectedFolder.toUpperCase()
    );
    if (result.success && result.data) {
      // Ensure mapping from RealEmailMessage to EmailMessage if necessary
      emails = result.data.map((email) => ({
        ...email,
        date: new Date(email.date), // Ensure date is a Date object
      }));
    } else {
      console.error(
        `Failed to load emails for ${selectedFolder}:`,
        result.error
      );
    }

    if (selectedEmailId && action !== "compose") {
      selectedEmailData = emails.find((e) => e.id === selectedEmailId) || null;
      // markEmailAsRead will be called by PleskEmailView if needed
    }

    if (action === "compose" && replyToEmailId) {
      // Attempt to find the email to reply to from the current list
      // A more robust solution might involve fetching it specifically if not found
      replyToEmailData = emails.find((e) => e.id === replyToEmailId) || null;
      if (!replyToEmailData) {
        // Potentially fetch the specific email if not in the current list
        // For now, we assume it should be available or PleskEmailCompose handles ID.
        console.warn(
          `Email to reply to (ID: ${replyToEmailId}) not found in current list.`
        );
      }
    }
  }

  // TODO: Fetch dynamic folder counts using getEmailFolders(accountConfig.id)
  const emailFoldersForSidebar: EmailFolder[] = [
    {
      id: "inbox",
      name: "Caixa de Entrada",
      count: emails.filter(
        (e) => e.folder.toLowerCase() === "inbox" && !e.isRead
      ).length,
      icon: <Inbox className="h-4 w-4" />,
    },
    {
      id: "sent",
      name: "Enviados",
      count: 0,
      icon: <Send className="h-4 w-4" />,
    }, // Placeholder counts
    {
      id: "drafts",
      name: "Rascunhos",
      count: 0,
      icon: <Mail className="h-4 w-4" />,
    },
    {
      id: "archive",
      name: "Arquivo",
      count: 0,
      icon: <Archive className="h-4 w-4" />,
    },
    {
      id: "spam",
      name: "Spam",
      count: 0,
      icon: <Shield className="h-4 w-4" />,
    },
    {
      id: "trash",
      name: "Lixeira",
      count: 0,
      icon: <Trash2 className="h-4 w-4" />,
    },
  ];

  const handleEmailSendAction = async (formData: FormData) => {
    "use server";
    if (!activeAccount || !accountConfig)
      return { success: false, error: "Active account not configured." };
    formData.append("accountId", accountConfig.id);
    try {
      const result = await sendEmail(formData);
      if (result.success) {
        // Revalidate or redirect as needed, handled by sendEmail action or page.tsx
      } else {
        console.error("Failed to send email:", result.error);
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  const handleEmailDeleteAction = async (
    emailId: string,
    folderName: string
  ) => {
    "use server";
    if (!activeAccount || !accountConfig)
      return { success: false, error: "Active account not configured." };
    try {
      const result = await deleteEmail(accountConfig.id, emailId, folderName);
      if (result.success) {
        // Revalidate or redirect
      } else {
        console.error("Failed to delete email:", result.error);
      }
    } catch (error) {
      console.error("Error deleting email:", error);
    }
  };

  if (initialMailAccounts.length === 0 || action === "setupAccount") {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              E-mail Plesk
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure e gerencie suas contas de e-mail profissionais
            </p>
          </div>
        </div>

        {/* Setup Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Server className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Configuração Rápida</CardTitle>
              <CardDescription>
                Configure uma conta de e-mail em poucos cliques usando seus
                domínios Plesk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href={`/email?action=setupAccount${currentAccountId ? `&accountId=${currentAccountId}` : ""}${selectedFolder ? `&folder=${selectedFolder}` : ""}`}
              >
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Conta de E-mail
                </Button>
              </Link>
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
              <CardTitle>Armazenamento Ilimitado</CardTitle>
              <CardDescription>
                Espaço generoso para suas mensagens e anexos
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {(initialMailAccounts.length === 0 || action === "setupAccount") && (
          <PleskEmailAccountSetup
            domains={domains}
            user={user}
            cancelHref="/email"
            // onAccountCreated is handled by the form action within PleskEmailAccountSetup
            // onCancel should be a Link within PleskEmailAccountSetup to navigate away
            // e.g., <Link href={`/email${currentAccountId ? `?accountId=${currentAccountId}` : ''}`}>Cancelar</Link>
          />
        )}
      </div>
    );
  }

  if (!activeAccount || !accountConfig) {
    return (
      <Card className="m-6">
        <CardHeader>
          <CardTitle>Configuração de Conta Necessária</CardTitle>
          <CardDescription>
            Por favor, selecione uma conta de e-mail válida ou configure uma
            nova para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/email?action=setupAccount">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Configurar Nova Conta
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] flex gap-6">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <PleskEmailSidebar
          folders={emailFoldersForSidebar}
          selectedFolder={selectedFolder}
          // onFolderSelect, onCompose, onAccountSelect, onAddAccount
          // will be handled by Link components within PleskEmailSidebar
          // It will need currentAccountId, selectedFolder to build links.
          mailAccounts={initialMailAccounts}
          activeAccount={activeAccount}
          user={user}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 min-w-0">
        {/* Email List */}
        <div className="w-96 flex-shrink-0">
          <PleskEmailList
            emails={emails} // Assumes emails are already filtered for selectedFolder
            selectedEmail={selectedEmailData}
            // onEmailSelect will be handled by Link components within PleskEmailList
            folder={selectedFolder}
            // isLoading is not needed for server component
          />
        </div>

        {/* Email Content */}
        <div className="flex-1 min-w-0">
          {action === "compose" ? (
            <PleskEmailCompose
              // onSend will be a form action using handleEmailSendAction
              // onCancel will be a Link component
              sendAction={handleEmailSendAction}
              replyTo={replyToEmailData}
              fromAccount={activeAccount}
              // currentAccountId={currentAccountId}
              // currentFolder={selectedFolder}
              // selectedEmailId={selectedEmailId} // To build cancel link
            />
          ) : selectedEmailData ? (
            <PleskEmailView
              email={selectedEmailData}
              // onReply, onForward will be Link components
              // onDelete will be a form action using handleEmailDeleteAction
              deleteAction={handleEmailDeleteAction}
              markAsReadAction={markEmailAsRead} // Pass the server action
              accountId={accountConfig.id}
              // currentAccountId, currentFolder for Link construction
            />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent>
                <div className="text-center text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">
                    Nenhum e-mail selecionado
                  </p>
                  <p className="text-sm">
                    Selecione um e-mail da lista ou{" "}
                    <Link
                      href={`/email?accountId=${currentAccountId}&folder=${selectedFolder}&action=compose`}
                      className="text-primary hover:underline"
                    >
                      componha uma nova mensagem.
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

interface PleskEmailClientProps {
  user: User;
  domains: Array<{
    id: string;
    name: string;
    pleskId?: number;
    pleskSiteId?: number;
    status: string;
  }>;
  initialMailAccounts?: MailName[];
  searchParams: Promise<PleskEmailSearchParams>;
}

export interface PleskEmailSearchParams {
  folder?: string;
  emailId?: string;
  accountId?: string;
  action?: "compose" | "setupAccount";
  replyTo?: string;
}

interface EmailFolder {
  id: string;
  name: string;
  count: number;
  icon: React.ReactNode;
}

interface EmailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  preview: string;
  date: Date;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment: boolean;
  folder: string;
  body?: string;
  html?: string;
}

type AccountConfig = Exclude<
  Awaited<ReturnType<typeof getEmailAccountSettings>>["data"],
  undefined
>[number];
