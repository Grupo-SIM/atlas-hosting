"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  Inbox, 
  Send, 
  Archive, 
  Trash2, 
  Search, 
  Compose,
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
  Calendar,
  Users,
  FolderOpen
} from "lucide-react";
import { EmailSidebar } from "./EmailSidebar";
import { EmailList } from "./EmailList";
import { EmailView } from "./EmailView";
import { ComposeEmail } from "./ComposeEmail";
import { EmailHeader } from "./EmailHeader";

interface Domain {
  id: string;
  name: string;
  pleskId?: number;
  status: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface EmailClientProps {
  user: User;
  domains: Domain[];
}

export function EmailClient({ user, domains }: EmailClientProps) {
  const [selectedFolder, setSelectedFolder] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      {/* Email Header */}
      <EmailHeader 
        onCompose={() => setIsComposing(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Email Interface */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Sidebar */}
        <EmailSidebar 
          selectedFolder={selectedFolder}
          onFolderChange={setSelectedFolder}
          onCompose={() => setIsComposing(true)}
        />

        {/* Email Content Area */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Email List */}
          <div className="w-80 min-h-0">
            <EmailList 
              folder={selectedFolder}
              searchQuery={searchQuery}
              selectedEmailId={selectedEmail}
              onEmailSelect={setSelectedEmail}
            />
          </div>

          {/* Email View */}
          <div className="flex-1 min-h-0">
            {selectedEmail ? (
              <EmailView 
                emailId={selectedEmail}
                onReply={() => setIsComposing(true)}
                onClose={() => setSelectedEmail(null)}
              />
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center">
                  <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">
                    Selecione um e-mail
                  </h3>
                  <p className="text-muted-foreground">
                    Escolha um e-mail da lista para visualizar seu conteúdo
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Compose Email Modal/Panel */}
      {isComposing && (
        <ComposeEmail 
          onClose={() => setIsComposing(false)}
          onSend={() => {
            setIsComposing(false);
            // Refresh email list
          }}
        />
      )}
    </div>
  );
}
