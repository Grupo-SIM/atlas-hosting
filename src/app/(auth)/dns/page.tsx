import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  description: "Cadastro de domínios no Atlas Hosting.",
  title: "Gerenciamento de DNS - Atlas Hosting",
};

export default function DnsManagementPage() {
  return (
    <div className="p-4 pb-16 md:p-6">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Gerenciamento de DNS indisponível</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            A Atlas não altera zonas DNS de domínios cadastrados. Gerencie os
            registros no provedor DNS atual do domínio.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}