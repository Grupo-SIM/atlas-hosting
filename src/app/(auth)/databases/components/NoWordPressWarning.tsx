"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface NoWordPressWarningProps {
  domainName?: string; // Optional: pass the specific domain if known
}

export default function NoWordPressWarning({
  domainName,
}: NoWordPressWarningProps) {
  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl border-2 border-amber-500/50 bg-amber-50/10 backdrop-blur-md">
      <CardHeader className="text-center">
        <div className="mx-auto bg-amber-100 dark:bg-amber-900 p-3 rounded-full w-fit mb-3">
          <AlertTriangle className="h-10 w-10 text-amber-500" />
        </div>
        <CardTitle className="text-2xl font-bold text-amber-700 dark:text-amber-400">
          Nenhuma Instalação do WordPress Encontrada
        </CardTitle>
        <CardDescription className="text-amber-600 dark:text-amber-300 text-base">
          {domainName
            ? `O domínio "${domainName}" não possui uma instalação do WordPress. `
            : "Seu domínio selecionado não possui uma instalação do WordPress. "}
          Para gerenciar bancos de dados, é necessário um site WordPress.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        <p className="text-center text-muted-foreground">
          Por favor, instale o WordPress em seu domínio para prosseguir, ou selecione um domínio
          que já possui o WordPress instalado.
        </p>
        <Button
          asChild
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
        >
          <Link href="/sites/new">Instalar WordPress</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
