"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles } from "lucide-react";
import Link from "next/link";

const domainExtensions = [
  { extension: ".com", price: "R$29.99" },
  { extension: ".net", price: "R$74.99" },
  { extension: ".io", price: "R$185.99" },
  { extension: ".org", price: "R$49.99" },
  { extension: ".online", price: "R$11.99" },
  { extension: ".shop", price: "R$2.99" },
];

export default function RegisterDomainPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-3xl font-bold">Compre um Novo Domínio</h1>
          
          <div className="inline-flex rounded-full p-1 bg-white dark:bg-accent w-full max-w-2xl">
            <Button 
              variant="default" 
              className="flex-1 rounded-full bg-primary"
            >
              Encontrar novo domínio
            </Button>
            <Button 
              variant="ghost" 
              className="flex-1 rounded-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Gerar domínio usando IA
            </Button>
          </div>
          
          <p className="text-muted-foreground">
            Digite no campo de pesquisa o nome de domínio que você deseja e descubra se ele está disponível!
          </p>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Insira o nome de domínio que você deseja"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="bg-primary">
              Pesquisar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
          {domainExtensions.map((domain) => (
            <Card key={domain.extension} className="text-center">
              <CardContent className="pt-6">
                <p className="text-lg font-semibold">{domain.extension}</p>
                <p className="text-sm text-muted-foreground">{domain.price}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 mb-4">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-full h-full text-primary"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Registre um domínio para colocar seu site online</h2>
            <p className="text-muted-foreground mb-6">
              Registre um novo domínio ou configure suas zonas DNS.
            </p>
            <div className="space-y-3">
              <Button className="w-full" size="lg">
                Comprar novo domínio
              </Button>
              <Button variant="outline" className="w-full" size="lg" asChild>
                <Link href="/domains/dns">
                  Zona DNS
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}