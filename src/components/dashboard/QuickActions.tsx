import { getUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { TooltipArrow, TooltipTrigger } from "@radix-ui/react-tooltip";
import clsx from "clsx";
import {
  BookPlus,
  Building2,
  CreditCard,
  Globe,
  History,
  HousePlus,
  LucideBookMarked,
  Mail,
  ShieldCheck,
  Train as Transfer,
} from "lucide-react";
import Link from "next/link";
import { FaTasks } from "react-icons/fa";
import { Card, CardContent } from "../ui/card";
import { Tooltip, TooltipContent, TooltipProvider } from "../ui/tooltip";

export async function QuickActions() {
  const user = await getUser();

  const canAdministrate = !!(
    user.organization.planId && user.organization.domains
  );

  return (
    <div className="grid gap-8">
      <div>
        <h2 className="text-2xl font-semibold mb-6">Sites</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <QuickActionButton
            Icon={FaTasks}
            title="Planos de Hospedagem"
            subtitle="Escolha o plano ideal para seu projeto"
            href="/plans"
            iconClassName="text-foreground"
          />

          <QuickActionButton
            Icon={Building2}
            title="Organização"
            subtitle="Administre as configurações de sua organização"
            href="/organization"
            iconClassName="text-purple-500"
          />

          <QuickActionButton
            Icon={BookPlus}
            title="Nova Instalação WordPress"
            subtitle="Crie novas instalações apartir de seus domínios"
            href="/sites/new"
            iconClassName="text-green-600 dark:text-green-500"
          />

          <QuickActionButton
            Icon={Mail}
            title="Meu Email"
            subtitle="Acesse suas caixas de email"
            href="/email"
            iconClassName="text-orange-500"
          />

          <QuickActionButton
            Icon={LucideBookMarked}
            title="Meus Sites"
            subtitle="Gerencie seus sites WordPress"
            href="/sites"
            iconClassName="text-indigo-500"
          />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <QuickActionButton
                  Icon={ShieldCheck}
                  title="Acessar painel de administrador"
                  subtitle={
                    canAdministrate
                      ? `Acesse o painel de administrador WordPress do site ${user.selectedDomain}`
                      : "Adicione um plano ou compre um domínio para acessar esta área."
                  }
                  disabled={!canAdministrate}
                  target="_blank"
                  href={
                    canAdministrate
                      ? `https://www.${user.selectedDomain}/wp-admin`
                      : "#"
                  }
                  iconClassName="text-red-500"
                />
              </TooltipTrigger>
              <TooltipContent
                hidden={canAdministrate}
                align="center"
                className="p-4"
              >
                Adicione um plano ou compre um domínio para acessar esta área.
                <TooltipArrow className="fill-border" />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Domains Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Domínios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <QuickActionButton
            Icon={Globe}
            title="Meus Domínios"
            subtitle="Gerencie seus domínios"
            href="/domains"
            iconClassName="text-blue-500"
          />

          <QuickActionButton
            Icon={HousePlus}
            title="Novo Domínio"
            subtitle="Registre um novo domínio"
            href="/domains/register"
            iconClassName="text-green-500"
          />

          <QuickActionButton
            Icon={Transfer}
            title="Zona DNS"
            subtitle="Gerencie suas zonas DNS"
            href="/dns"
            iconClassName="text-orange-500"
          />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-6">Faturas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuickActionButton
            Icon={CreditCard}
            title="Assinaturas"
            subtitle="Gerencie suas assinaturas"
            href="/billing/subscriptions"
            iconClassName="text-purple-500"
          />

          <QuickActionButton
            Icon={History}
            title="Histórico de Pagamentos"
            subtitle="Visualize seu histórico de pagamentos"
            href="/billing"
            iconClassName="text-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({
  title,
  subtitle,
  href,
  target,
  disabled,
  Icon,
  iconClassName,
}: {
  title: string;
  subtitle: string;
  href: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconClassName?: string;
  disabled?: boolean;
  target?: string;
}) {
  return (
    <Link
      target={target}
      href={href}
      className={cn("h-full block", {
        "brigthness-80 opacity-20 pointer-events-none": !!disabled,
      })}
    >
      <Card className="h-full shadow-none">
        <CardContent className="h-full p-8 flex flex-col items-start justify-start text-left space-y-3 hover:bg-accent group">
          <Icon
            className={clsx([
              "h-10 w-10 mb-4 group-hover:scale-110 transition-transform",
              iconClassName,
            ])}
          />
          <div className="space-y-2">
            <span className="text-xl font-medium block">{title}</span>
            <span className="text-sm text-muted-foreground block">
              {subtitle}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
