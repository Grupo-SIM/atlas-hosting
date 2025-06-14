import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles } from "lucide-react";
import type { PropsWithChildren } from "react";
import "react-loading-skeleton/dist/skeleton.css";

import Link from "next/link";

export default async function DomainsRegisterTransferLayout({
  children,
}: PropsWithChildren) {
  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Gerenciar Domínios</h1>
        <p className="text-muted-foreground">
          Registre um novo domínio ou transfira um domínio existente para sua
          conta
        </p>
      </div>

      <Tabs defaultValue="register" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-2xl mx-auto">
          <TabsTrigger asChild value="register">
            <Link href="/domains/register">Encontrar novo domínio</Link>
          </TabsTrigger>
          <TabsTrigger value="transfer" asChild>
            <Link href="/domains/transfer" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Transferir domínio existente
            </Link>
          </TabsTrigger>
        </TabsList>
        {children}
      </Tabs>
    </div>
  );
}
