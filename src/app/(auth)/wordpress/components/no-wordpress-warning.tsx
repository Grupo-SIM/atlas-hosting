import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, PlusCircle } from "lucide-react";
import Link from "next/link";

interface NoWordPressWarningProps {
  domainName: string;
}

export function NoWordPressWarning({ domainName }: NoWordPressWarningProps) {
  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30">
      <CardHeader className="text-center">
        <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <CardTitle className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
          WordPress não encontrado!
        </CardTitle>
        <CardDescription className="text-yellow-600 dark:text-yellow-400 mt-2 text-base">
          Nenhuma instalação do WordPress foi detectada para o domínio{" "}
          <span className="font-semibold">{domainName}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="mb-6 text-muted-foreground">
          Para gerenciar um banco de dados, primeiro é necessário ter uma instalação ativa do WordPress.
        </p>
        <Button asChild size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-600 dark:hover:bg-yellow-700">
          <Link href="/sites/new">
            <PlusCircle className="mr-2 h-5 w-5" />
            Criar Nova Instalação WordPress
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
