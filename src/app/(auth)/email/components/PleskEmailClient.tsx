"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  Inbox, 
  Send, 
  Archive, 
  Trash2, 
  Search, 
  PenTool,
  Settings,
  Star,
  MoreHorizontal,
  Paperclip,
  Reply,
  ReplyAll,
  Forward,
  RefreshCw,
  Filter,
  User,
  Plus,
  Server,
  Shield,
  HardDrive
} from "lucide-react";
import { PleskEmailSidebar } from "./PleskEmailSidebar";
import { PleskEmailList } from "./PleskEmailList";
import { PleskEmailView } from "./PleskEmailView";
import { PleskEmailCompose } from "./PleskEmailCompose";
import { PleskEmailAccountSetup } from "./PleskEmailAccountSetup";
import type { MailName } from "@/lib/server/apis/plesk-xml/types";
import type { EmailMessage as RealEmailMessage } from "@/lib/server/apis/email";
import { getEmailMessages, getEmailFolders, sendEmail, markEmailAsRead, deleteEmail, getEmailAccountSettings } from "../actions";

interface PleskEmailClientProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
  domains: Array<{
    id: string;
    name: string;
    pleskId?: number;
    pleskSiteId?: number;
    status: string;
  }>;
  initialMailAccounts?: MailName[];
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

export function PleskEmailClient({ user, domains, initialMailAccounts = [] }: PleskEmailClientProps) {
  const [selectedFolder, setSelectedFolder] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [showAccountSetup, setShowAccountSetup] = useState(false);
  const [mailAccounts, setMailAccounts] = useState<MailName[]>(initialMailAccounts);
  const [activeAccount, setActiveAccount] = useState<MailName | null>(
    initialMailAccounts[0] || null
  );
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [folders, setFolders] = useState<EmailFolder[]>([
    { id: "inbox", name: "Caixa de Entrada", count: 0, icon: <Inbox className="h-4 w-4" /> },
    { id: "sent", name: "Enviados", count: 0, icon: <Send className="h-4 w-4" /> },
    { id: "drafts", name: "Rascunhos", count: 0, icon: <Mail className="h-4 w-4" /> },
    { id: "archive", name: "Arquivo", count: 0, icon: <Archive className="h-4 w-4" /> },
    { id: "spam", name: "Spam", count: 0, icon: <Shield className="h-4 w-4" /> },
    { id: "trash", name: "Lixeira", count: 0, icon: <Trash2 className="h-4 w-4" /> },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Load emails when active account or folder changes
  useEffect(() => {
    if (activeAccount) {
      loadEmails();
    }
  }, [activeAccount]); // Only depend on activeAccount, not selectedFolder

  const loadEmails = async () => {
    if (!activeAccount) return;
    
    setIsLoading(true);
    try {
      // Find the corresponding database account config
      const accountConfigs = await getEmailAccountSettings();
      if (!accountConfigs.success) {
        console.error("Failed to get account settings");
        return;
      }

      const accountConfig = accountConfigs.data?.find(
        config => config.emailAddress === `${activeAccount.name}@${activeAccount.site_name}`
      );

      if (!accountConfig) {
        console.error("Account configuration not found");
        return;
      }

      const result = await getEmailMessages(accountConfig.id, selectedFolder.toUpperCase());
      if (result.success && result.data) {
        setEmails(result.data);
      } else {
        console.error("Failed to load emails:", result.error);
        setEmails([]);
      }
    } catch (error) {
      console.error("Error loading emails:", error);
      setEmails([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmails = emails.filter(email => email.folder.toLowerCase() === selectedFolder);

  const handleEmailSelect = async (email: EmailMessage) => {
    setSelectedEmail(email);
    setIsComposing(false);
    
    // Mark email as read if it's not already read
    if (!email.isRead && activeAccount) {
      try {
        const accountConfigs = await getEmailAccountSettings();
        if (accountConfigs.success && accountConfigs.data) {
          const accountConfig = accountConfigs.data.find(
            config => config.emailAddress === `${activeAccount.name}@${activeAccount.site_name}`
          );
          
          if (accountConfig) {
            await markEmailAsRead(accountConfig.id, email.id, selectedFolder.toUpperCase());
            // Update local state
            setEmails(prev => prev.map(e => e.id === email.id ? { ...e, isRead: true } : e));
          }
        }
      } catch (error) {
        console.error("Failed to mark email as read:", error);
      }
    }
  };

  const handleCompose = () => {
    setSelectedEmail(null);
    setIsComposing(true);
  };

  const handleReply = (email: EmailMessage) => {
    setIsComposing(true);
    setSelectedEmail(null);
  };

  const handleEmailSend = async (emailData: {
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    text?: string;
    html?: string;
  }) => {
    if (!activeAccount) return;
    
    try {
      const accountConfigs = await getEmailAccountSettings();
      if (!accountConfigs.success || !accountConfigs.data) {
        console.error("Failed to get account settings");
        return;
      }

      const accountConfig = accountConfigs.data.find(
        config => config.emailAddress === `${activeAccount.name}@${activeAccount.site_name}`
      );

      if (!accountConfig) {
        console.error("Account configuration not found");
        return;
      }

      const formData = new FormData();
      formData.append("accountId", accountConfig.id);
      formData.append("to", emailData.to);
      formData.append("cc", emailData.cc || "");
      formData.append("bcc", emailData.bcc || "");
      formData.append("subject", emailData.subject);
      formData.append("text", emailData.text || "");
      formData.append("html", emailData.html || "");

      const result = await sendEmail(formData);
      if (result.success) {
        setIsComposing(false);
        // Optionally reload emails to show the sent message
        await loadEmails();
      } else {
        console.error("Failed to send email:", result.error);
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  const handleEmailDelete = async (email: EmailMessage) => {
    if (!activeAccount) return;
    
    try {
      const accountConfigs = await getEmailAccountSettings();
      if (!accountConfigs.success || !accountConfigs.data) {
        console.error("Failed to get account settings");
        return;
      }

      const accountConfig = accountConfigs.data.find(
        config => config.emailAddress === `${activeAccount.name}@${activeAccount.site_name}`
      );

      if (!accountConfig) {
        console.error("Account configuration not found");
        return;
      }

      const result = await deleteEmail(accountConfig.id, email.id, selectedFolder.toUpperCase());
      if (result.success) {
        // Remove from local state
        setEmails(prev => prev.filter(e => e.id !== email.id));
        if (selectedEmail?.id === email.id) {
          setSelectedEmail(null);
        }
      } else {
        console.error("Failed to delete email:", result.error);
      }
    } catch (error) {
      console.error("Error deleting email:", error);
    }
  };

  const handleAccountCreated = (newAccount: MailName) => {
    setMailAccounts(prev => [...prev, newAccount]);
    if (!activeAccount) {
      setActiveAccount(newAccount);
    }
    setShowAccountSetup(false);
  };

  // Show account setup if no accounts exist
  if (mailAccounts.length === 0) {
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
                Configure uma conta de e-mail em poucos cliques usando seus domínios Plesk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowAccountSetup(true)} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Criar Conta de E-mail
              </Button>
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

        {showAccountSetup && (
          <PleskEmailAccountSetup
            domains={domains}
            user={user}
            onAccountCreated={handleAccountCreated}
            onCancel={() => setShowAccountSetup(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] flex gap-6">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <PleskEmailSidebar
          folders={folders}
          selectedFolder={selectedFolder}
          onFolderSelect={setSelectedFolder}
          onCompose={handleCompose}
          mailAccounts={mailAccounts}
          activeAccount={activeAccount}
          onAccountSelect={setActiveAccount}
          onAddAccount={() => setShowAccountSetup(true)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 min-w-0">
        {/* Email List */}
        <div className="w-96 flex-shrink-0">
          <PleskEmailList
            emails={filteredEmails}
            selectedEmail={selectedEmail}
            onEmailSelect={handleEmailSelect}
            folder={selectedFolder}
            isLoading={isLoading}
          />
        </div>

        {/* Email Content */}
        <div className="flex-1 min-w-0">
          {isComposing ? (
            <PleskEmailCompose
              onSend={handleEmailSend}
              onCancel={() => setIsComposing(false)}
              replyTo={selectedEmail}
              fromAccount={activeAccount}
            />
          ) : selectedEmail ? (
            <PleskEmailView
              email={selectedEmail}
              onReply={() => handleReply(selectedEmail)}
              onForward={() => handleReply(selectedEmail)}
              onDelete={() => handleEmailDelete(selectedEmail)}
            />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent>
                <div className="text-center text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Nenhum e-mail selecionado</p>
                  <p className="text-sm">
                    Selecione um e-mail da lista ou{" "}
                    <Button variant="link" className="p-0 h-auto" onClick={handleCompose}>
                      componha uma nova mensagem
                    </Button>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Account Setup Modal */}
      {showAccountSetup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <PleskEmailAccountSetup
              domains={domains}
              user={user}
              onAccountCreated={handleAccountCreated}
              onCancel={() => setShowAccountSetup(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
