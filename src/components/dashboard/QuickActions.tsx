import type { Variants } from "framer-motion";
import {
  ArrowRight,
  ArrowRightLeft,
  BookPlus,
  Building2,
  CreditCard,
  Globe,
  History,
  HousePlus,
  LucideBookMarked,
  Mail,
  Sparkles,
  Train as Transfer,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { FaTasks } from "react-icons/fa";
import { getUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { MotionDiv } from "./MotionDiv";

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.08,
    },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      damping: 25,
      stiffness: 400,
      type: "spring",
    },
    y: 0,
  },
};

export function QuickActions() {
  return (
    <MotionDiv
      animate="visible"
      className="space-y-8"
      initial="hidden"
      variants={containerVariants}
    >
      {/* Domains Section */}
      <MotionDiv variants={itemVariants}>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
            <Globe className="h-4 w-4 text-white" />
          </div>
          <h2 className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text font-bold text-2xl text-transparent">
            Domínios
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <QuickActionCard
            gradient="from-blue-500 to-indigo-500"
            href="/domains"
            Icon={Globe}
            pattern="grid"
            subtitle="Gerencie seus domínios registrados"
            title="Meus Domínios"
          />

          <QuickActionCard
            gradient="from-green-500 to-emerald-500"
            href="/domain?tab=register"
            Icon={HousePlus}
            pattern="dots"
            subtitle="Registre um novo domínio"
            title="Novo Domínio"
          />

          <QuickActionCard
            gradient="from-orange-500 to-amber-500"
            href="/dns"
            Icon={Transfer}
            pattern="waves"
            subtitle="Gerencie suas configurações DNS"
            title="Zona DNS"
          />
        </div>
      </MotionDiv>

      {/* Billing Section */}
      <MotionDiv variants={itemVariants}>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
            <CreditCard className="h-4 w-4 text-white" />
          </div>
          <h2 className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text font-bold text-2xl text-transparent">
            Faturas
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* <QuickActionCard
            Icon={CreditCard}
            title="Assinaturas"
            subtitle="Gerencie suas assinaturas ativas"
            href="/subscriptions"
            gradient="from-purple-500 to-violet-500"
            pattern="grid"
          /> */}

          <QuickActionCard
            gradient="from-blue-500 to-cyan-500"
            href="/billing"
            Icon={History}
            pattern="dots"
            subtitle="Visualize seu histórico de transações"
            title="Histórico de Pagamentos"
          />
        </div>
      </MotionDiv>
    </MotionDiv>
  );
}

export function SitesQuickActions() {
  return (
    <MotionDiv
      animate="visible"
      className="space-y-8"
      initial="hidden"
      variants={containerVariants}
    >
      {/* Sites Section */}
      <MotionDiv variants={itemVariants}>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h2 className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text font-bold text-2xl text-transparent">
            Sites
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <QuickActionCard
                    disabled={true}
                    gradient="from-blue-500 to-cyan-500"
                    href="/plans"
                    Icon={FaTasks}
                    pattern="dots"
                    subtitle="Escolha o plano ideal para seu projeto"
                    title="Planos de Hospedagem"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent className="font-medium">Em breve</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <QuickActionCard
                    disabled={true}
                    gradient="from-purple-500 to-pink-500"
                    href="/organization"
                    Icon={Building2}
                    pattern="grid"
                    subtitle="Administre as configurações de sua organização"
                    title="Organização"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent className="font-medium">Em breve</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <QuickActionCard
                    disabled={true}
                    gradient="from-emerald-500 to-teal-500"
                    href="/sites/new"
                    Icon={BookPlus}
                    pattern="waves"
                    subtitle="Crie novas instalações a partir de seus domínios"
                    title="Nova Instalação WordPress"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent className="font-medium">Em breve</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <QuickActionCard
                    disabled={true}
                    gradient="from-orange-500 to-red-500"
                    href="/email"
                    Icon={Mail}
                    pattern="dots"
                    subtitle="Acesse suas caixas de email"
                    title="Meu Email"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent className="font-medium">Em breve</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <QuickActionCard
                    disabled={true}
                    gradient="from-indigo-500 to-blue-500"
                    href="/wordpress"
                    Icon={LucideBookMarked}
                    pattern="grid"
                    subtitle="Gerencie seus sites WordPress"
                    title="Meus Sites"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent className="font-medium">Em breve</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Suspense fallback={<Skeleton className="h-44 w-full rounded-2xl" />}>
            <AdminPanelCard />
          </Suspense>
        </div>
      </MotionDiv>
    </MotionDiv>
  );
}

interface QuickActionCardProps {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  subtitle: string;
  href: string;
  gradient: string;
  pattern: "dots" | "grid" | "waves";
  disabled?: boolean;
  target?: string;
}

export function QuickActionCard({
  Icon,
  title,
  subtitle,
  href,
  gradient,
  pattern,
  disabled = false,
  target,
}: QuickActionCardProps) {
  return (
    <MotionDiv className="group" variants={itemVariants}>
      {disabled ? (
        <div
          className={cn(
            "relative block h-full overflow-hidden rounded-2xl border border-border/40 transition-all duration-300",
            "cursor-not-allowed opacity-50"
          )}
        >
          {/* Background Pattern */}
          <div
            className={cn(
              "absolute inset-0 opacity-10",
              pattern === "dots" && "bg-dots-pattern",
              pattern === "grid" && "bg-grid-pattern",
              pattern === "waves" && "bg-waves-pattern"
            )}
          />

          {/* Gradient Background */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-5 transition-opacity duration-300",
              gradient
            )}
          />

          {/* Content */}
          <div className="relative flex h-full flex-col p-6">
            {/* Icon */}
            <div
              className={cn(
                "mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300",
                "bg-gradient-to-br shadow-lg",
                gradient
              )}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>

            {/* Text Content */}
            <div className="flex-1">
              <h3 className="mb-2 font-semibold text-foreground text-lg transition-colors duration-200">
                {title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Arrow Icon */}
            <div className="mt-4 flex justify-end">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 transition-all duration-200">
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-all duration-200" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Link
          className={cn(
            "relative block h-full overflow-hidden rounded-2xl border border-border/40 transition-all duration-300",
            "hover:-translate-y-1 hover:border-border/60 hover:shadow-xl"
          )}
          href={href}
          prefetch
          target={target}
        >
          {/* Background Pattern */}
          <div
            className={cn(
              "absolute inset-0 opacity-10",
              pattern === "dots" && "bg-dots-pattern",
              pattern === "grid" && "bg-grid-pattern",
              pattern === "waves" && "bg-waves-pattern"
            )}
          />

          {/* Gradient Background */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-5 transition-opacity duration-300 group-hover:opacity-10",
              gradient
            )}
          />

          {/* Content */}
          <div className="relative flex h-full flex-col p-6">
            {/* Icon */}
            <div
              className={cn(
                "mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300",
                "bg-gradient-to-br shadow-lg group-hover:scale-110 group-hover:shadow-xl",
                gradient
              )}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>

            {/* Text Content */}
            <div className="flex-1">
              <h3 className="mb-2 font-semibold text-foreground text-lg transition-colors duration-200 group-hover:text-primary">
                {title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Arrow Icon */}
            <div className="mt-4 flex justify-end">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 transition-all duration-200 group-hover:bg-primary/10">
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </div>

            {/* Hover Glow Effect */}
            <div
              className={cn(
                "pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-20",
                "bg-gradient-to-br",
                gradient
              )}
            />
          </div>
        </Link>
      )}
    </MotionDiv>
  );
}

async function AdminPanelCard() {
  const user = await getUser();

  const canAdministrate = !!(
    user.organization.planId && user.organization.domains.length > 0
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <QuickActionCard
              disabled={true}
              gradient="from-red-500 to-rose-500"
              href="#"
              Icon={ArrowRightLeft}
              pattern="waves"
              subtitle="Transferir uma instalação existente para o Atlas Hosting"
              target="_blank"
              title="Transferir Instalação WordPress"
            />
          </div>
        </TooltipTrigger>
        <TooltipContent align="center" className="max-w-xs p-4 font-medium">
          <p className="text-sm">Em breve</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
