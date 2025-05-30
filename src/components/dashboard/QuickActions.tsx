"use client";

import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Globe,
  History,
  Mail,
  Plus,
  Server,
  Settings,
  ShoppingCart,
  Train as Transfer,
} from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  const currentSite = "vemproclubedolivro.com";

  return (
    <div className="grid gap-8">
      {/* Sites Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Sites</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Button
            variant="outline"
            className="h-auto p-8 flex flex-col items-start justify-start text-left space-y-3 hover:bg-accent group"
            asChild={true}
          >
            <Link href="/plans">
              <ShoppingCart className="h-10 w-10 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
              <div className="space-y-2">
                <span className="text-xl font-medium block">
                  Comprar Plano de Hospedagem
                </span>
                <span className="text-sm text-muted-foreground block">
                  Escolha o plano ideal para seu projeto
                </span>
              </div>
            </Link>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-8 flex flex-col items-start justify-start text-left space-y-3 hover:bg-accent group"
            asChild={true}
          >
            <Link href="/hosting/premium">
              <Server className="h-10 w-10 text-purple-500 mb-4 group-hover:scale-110 transition-transform" />
              <div className="space-y-2">
                <span className="text-xl font-medium block">
                  Premium Atlas Hosting
                </span>
                <span className="text-sm text-muted-foreground block">
                  Hospedagem premium com recursos avançados
                </span>
              </div>
            </Link>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-8 flex flex-col items-start justify-start text-left space-y-3 hover:bg-accent group"
            asChild={true}
          >
            <Link href="/sites/new">
              <Plus className="h-10 w-10 text-green-500 mb-4 group-hover:scale-110 transition-transform" />
              <div className="space-y-2">
                <span className="text-xl font-medium block">
                  Adicionar Novo Site
                </span>
                <span className="text-sm text-muted-foreground block">
                  Site atual: {currentSite}
                </span>
              </div>
            </Link>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-8 flex flex-col items-start justify-start text-left space-y-3 hover:bg-accent group"
            asChild={true}
          >
            <Link href="/email">
              <Mail className="h-10 w-10 text-orange-500 mb-4 group-hover:scale-110 transition-transform" />
              <div className="space-y-2">
                <span className="text-xl font-medium block">Meu Email</span>
                <span className="text-sm text-muted-foreground block">
                  Acesse suas caixas de email
                </span>
              </div>
            </Link>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-8 flex flex-col items-start justify-start text-left space-y-3 hover:bg-accent group"
            asChild={true}
          >
            <Link href="/wordpress">
              <Settings className="h-10 w-10 text-indigo-500 mb-4 group-hover:scale-110 transition-transform" />
              <div className="space-y-2">
                <span className="text-xl font-medium block">
                  Admin WordPress
                </span>
                <span className="text-sm text-muted-foreground block">
                  Gerencie seu site WordPress
                </span>
              </div>
            </Link>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-8 flex flex-col items-start justify-start text-left space-y-3 hover:bg-accent group"
            asChild={true}
          >
            <Link href="/cpanel">
              <Settings className="h-10 w-10 text-red-500 mb-4 group-hover:scale-110 transition-transform" />
              <div className="space-y-2">
                <span className="text-xl font-medium block">
                  Painel de Controle
                </span>
                <span className="text-sm text-muted-foreground block">
                  Acesse o cPanel
                </span>
              </div>
            </Link>
          </Button>
        </div>
      </div>

      {/* Domains Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Domínios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Button
            variant="outline"
            className="h-auto p-8 flex flex-col items-start justify-start text-left space-y-3 hover:bg-accent group"
            asChild={true}
          >
            <Link href="/domains">
              <Globe className="h-10 w-10 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
              <div className="space-y-2">
                <span className="text-xl font-medium block">Meus Domínios</span>
                <span className="text-sm text-muted-foreground block">
                  Gerencie seus domínios
                </span>
              </div>
            </Link>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-8 flex flex-col items-start justify-start text-left space-y-3 hover:bg-accent group"
            asChild={true}
          >
            <Link href="/domains/register">
              <ShoppingCart className="h-10 w-10 text-green-500 mb-4 group-hover:scale-110 transition-transform" />
              <div className="space-y-2">
                <span className="text-xl font-medium block">
                  Comprar Novo Domínio
                </span>
                <span className="text-sm text-muted-foreground block">
                  Registre um novo domínio
                </span>
              </div>
            </Link>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-8 flex flex-col items-start justify-start text-left space-y-3 hover:bg-accent group"
            asChild={true}
          >
            <Link href="/dns">
              <Transfer className="h-10 w-10 text-orange-500 mb-4 group-hover:scale-110 transition-transform" />
              <div className="space-y-2">
                <span className="text-xl font-medium block">Zona DNS</span>
                <span className="text-sm text-muted-foreground block">
                  Gerencie suas zonas DNS
                </span>
              </div>
            </Link>
          </Button>
        </div>
      </div>

      {/* Billing Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Faturas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Button
            variant="outline"
            className="h-auto p-8 flex flex-col items-start justify-start text-left space-y-3 hover:bg-accent group"
            asChild={true}
          >
            <Link href="/billing/subscriptions">
              <CreditCard className="h-10 w-10 text-purple-500 mb-4 group-hover:scale-110 transition-transform" />
              <div className="space-y-2">
                <span className="text-xl font-medium block">Assinaturas</span>
                <span className="text-sm text-muted-foreground block">
                  Gerencie suas assinaturas
                </span>
              </div>
            </Link>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-8 flex flex-col items-start justify-start text-left space-y-3 hover:bg-accent group"
            asChild={true}
          >
            <Link href="/billing/history">
              <History className="h-10 w-10 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
              <div className="space-y-2">
                <span className="text-xl font-medium block">
                  Histórico de Pagamento
                </span>
                <span className="text-sm text-muted-foreground block">
                  Visualize seu histórico de pagamentos
                </span>
              </div>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
