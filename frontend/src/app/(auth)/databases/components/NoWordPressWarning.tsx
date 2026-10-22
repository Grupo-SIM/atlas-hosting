"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface NoWordPressWarningProps {
  domainName?: string; // Optional: pass the specific domain if known
}

export default function NoWordPressWarning({
  domainName,
}: NoWordPressWarningProps) {
  return (
    <Card className="mx-auto w-full max-w-lg border-2 border-amber-500/50 bg-amber-50/10 shadow-xl backdrop-blur-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 w-fit rounded-full bg-amber-100 p-3 dark:bg-amber-900">
          <AlertTriangle className="h-10 w-10 text-amber-500" />
        </div>
        <CardTitle className="font-bold text-2xl text-amber-700 dark:text-amber-400">
          Nenhuma Instalação do WordPress Encontrada
        </CardTitle>
        <CardDescription className="text-amber-600 text-base dark:text-amber-300">
          {domainName
            ? `O domínio "${domainName}" não possui uma instalação do WordPress. `
            : "Seu domínio selecionado não possui uma instalação do WordPress. "}
          Para gerenciar bancos de dados, é necessário um site WordPress.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        <p className="text-center text-muted-foreground">
          Por favor, instale o WordPress em seu domínio para prosseguir, ou
          selecione um domínio que já possui o WordPress instalado.
        </p>
        <Button
          asChild
          className="transform rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 font-semibold text-white shadow-md transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:from-amber-600 hover:to-orange-700 hover:shadow-lg"
        >
          <Link href="/sites/new">Instalar WordPress</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
