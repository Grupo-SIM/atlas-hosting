import { getUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
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
import { Skeleton } from "../ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { MotionDiv } from "./MotionDiv";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 30, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
};

export function QuickActions() {
  return (
    <MotionDiv
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Domains Section */}
      <MotionDiv variants={itemVariants}>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Domínios
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <QuickActionCard
            Icon={Globe}
            title="Meus Domínios"
            subtitle="Gerencie seus domínios registrados"
            href="/domains"
            gradient="from-blue-500 to-indigo-500"
            pattern="grid"
          />

          <QuickActionCard
            Icon={HousePlus}
            title="Novo Domínio"
            subtitle="Registre um novo domínio"
            href="/domain?tab=register"
            gradient="from-green-500 to-emerald-500"
            pattern="dots"
          />

          <QuickActionCard
            Icon={Transfer}
            title="Zona DNS"
            subtitle="Gerencie suas configurações DNS"
            href="/dns"
            gradient="from-orange-500 to-amber-500"
            pattern="waves"
          />
        </div>
      </MotionDiv>

      {/* Billing Section */}
      <MotionDiv variants={itemVariants}>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
            <CreditCard className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Faturas
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* <QuickActionCard
            Icon={CreditCard}
            title="Assinaturas"
            subtitle="Gerencie suas assinaturas ativas"
            href="/subscriptions"
            gradient="from-purple-500 to-violet-500"
            pattern="grid"
          /> */}

          <QuickActionCard
            Icon={History}
            title="Histórico de Pagamentos"
            subtitle="Visualize seu histórico de transações"
            href="/billing"
            gradient="from-blue-500 to-cyan-500"
            pattern="dots"
          />
        </div>
      </MotionDiv>

    </MotionDiv>
  );
}

export function SitesQuickActions() {
  return (
    <MotionDiv
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Sites Section */}
      <MotionDiv variants={itemVariants}>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Sites
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <QuickActionCard
                    Icon={FaTasks}
                    title="Planos de Hospedagem"
                    subtitle="Escolha o plano ideal para seu projeto"
                    href="/plans"
                    gradient="from-blue-500 to-cyan-500"
                    pattern="dots"
                    disabled={true}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent className="font-medium">
                Em breve
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <QuickActionCard
                    Icon={Building2}
                    title="Organização"
                    subtitle="Administre as configurações de sua organização"
                    href="/organization"
                    gradient="from-purple-500 to-pink-500"
                    pattern="grid"
                    disabled={true}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent className="font-medium">
                Em breve
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <QuickActionCard
                    Icon={BookPlus}
                    title="Nova Instalação WordPress"
                    subtitle="Crie novas instalações a partir de seus domínios"
                    href="/sites/new"
                    gradient="from-emerald-500 to-teal-500"
                    pattern="waves"
                    disabled={true}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent className="font-medium">
                Em breve
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <QuickActionCard
                    Icon={Mail}
                    title="Meu Email"
                    subtitle="Acesse suas caixas de email"
                    href="/email"
                    gradient="from-orange-500 to-red-500"
                    pattern="dots"
                    disabled={true}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent className="font-medium">
                Em breve
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <QuickActionCard
                    Icon={LucideBookMarked}
                    title="Meus Sites"
                    subtitle="Gerencie seus sites WordPress"
                    href="/wordpress"
                    gradient="from-indigo-500 to-blue-500"
                    pattern="grid"
                    disabled={true}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent className="font-medium">
                Em breve
              </TooltipContent>
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

function QuickActionCard({
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
    <MotionDiv variants={itemVariants} className="group">
      {disabled ? (
        <div
          className={cn(
            "relative block h-full overflow-hidden rounded-2xl border border-border/40 transition-all duration-300",
            "opacity-50 cursor-not-allowed"
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
          <div className="relative p-6 h-full flex flex-col">
            {/* Icon */}
            <div
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-xl mb-4 transition-all duration-300",
                "bg-gradient-to-br shadow-lg",
                gradient
              )}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>

            {/* Text Content */}
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2 text-foreground transition-colors duration-200">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Arrow Icon */}
            <div className="flex justify-end mt-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50 transition-all duration-200">
                <ArrowRight className="w-4 h-4 text-muted-foreground transition-all duration-200" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Link
          prefetch
          href={href}
          target={target}
          className={cn(
            "relative block h-full overflow-hidden rounded-2xl border border-border/40 transition-all duration-300",
            "hover:border-border/60 hover:shadow-xl hover:-translate-y-1"
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
              "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-300",
              gradient
            )}
          />

          {/* Content */}
          <div className="relative p-6 h-full flex flex-col">
            {/* Icon */}
            <div
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-xl mb-4 transition-all duration-300",
                "bg-gradient-to-br shadow-lg group-hover:shadow-xl group-hover:scale-110",
                gradient
              )}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>

            {/* Text Content */}
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2 text-foreground group-hover:text-primary transition-colors duration-200">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Arrow Icon */}
            <div className="flex justify-end mt-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-all duration-200">
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
              </div>
            </div>

            {/* Hover Glow Effect */}
            <div
              className={cn(
                "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none",
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
              Icon={ArrowRightLeft}
              title="Transferir Instalação WordPress"
              subtitle="Transferir uma instalação existente para o Atlas Hosting"
              disabled={true}
              target="_blank"
              href="#"
              gradient="from-red-500 to-rose-500"
              pattern="waves"
            />
          </div>
        </TooltipTrigger>
        <TooltipContent
          align="center"
          className="p-4 max-w-xs font-medium"
        >
          <p className="text-sm">
            Em breve
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
