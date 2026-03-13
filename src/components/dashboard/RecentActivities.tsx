import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Server,
  Info,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Shield,
  User,
  Clock,
  Filter,
  Activity,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { db } from "@/lib/db";
import { pgLog } from "@/lib/db/schema";
import { desc, eq, count } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Suspense } from "react";
import Link from "next/link";

// Map severity to icons
const severityToIcon: Record<string, LucideIcon> = {
  info: Info,
  warning: AlertTriangle,
  danger: XCircle,
  success: CheckCircle,
};

// Map log types to icons
const typeToIcon: Record<string, LucideIcon> = {
  hosting: Server,
  account: User,
  security: Shield,
};

// Function to get icon based on type and severity priority
const getActivityIcon = (type: string, severity: string): LucideIcon => {
  // For danger and warning, prioritize severity
  if (severity === "danger" || severity === "warning") {
    return severityToIcon[severity];
  }
  // For others, use type-specific icons, fallback to severity
  return typeToIcon[type] || severityToIcon[severity] || Info;
};

// Map severity to colors with modern gradients
const severityToColor = {
  info: {
    gradient:
      "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30",
    icon: "text-blue-600 dark:text-blue-400",
    badge:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
    glow: "shadow-blue-200/50 dark:shadow-blue-900/30",
  },
  warning: {
    gradient:
      "bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/30",
    icon: "text-amber-600 dark:text-amber-400",
    badge:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
    glow: "shadow-amber-200/50 dark:shadow-amber-900/30",
  },
  danger: {
    gradient:
      "bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950/30 dark:to-rose-950/30",
    icon: "text-red-600 dark:text-red-400",
    badge:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
    glow: "shadow-red-200/50 dark:shadow-red-900/30",
  },
  success: {
    gradient:
      "bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950/30 dark:to-green-950/30",
    icon: "text-emerald-600 dark:text-emerald-400",
    badge:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
    glow: "shadow-emerald-200/50 dark:shadow-emerald-900/30",
  },
};

interface ActivityCardProps {
  activity: {
    id: string;
    type: string;
    severity: string;
    title: string;
    description: string;
    time: string;
    icon: LucideIcon;
    colors: typeof severityToColor.info;
  };
}

function ActivityCard({ activity }: ActivityCardProps) {
  const Icon = activity.icon;

  return (
    <div
      className={`
      group relative rounded-2xl border border-border/40 p-5 transition-all duration-300 ease-out
      hover:border-border/60 hover:shadow-lg hover:-translate-y-1
      ${activity.colors.gradient} ${activity.colors.glow}
      backdrop-blur-sm
    `}
    >
      {/* Hover effect overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 dark:from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex gap-4">
        {/* Icon with modern styling */}
        <div
          className={`
          flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl
          bg-white/80 dark:bg-white/10 backdrop-blur-sm border border-white/50 dark:border-white/20
          shadow-sm group-hover:shadow-md transition-all duration-300
          ${activity.colors.icon}
        `}
        >
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors duration-200">
              {activity.title}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge
                variant="outline"
                className={`text-xs font-medium ${activity.colors.badge}`}
              >
                {getActivityName(activity.type)}
              </Badge>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            {activity.description}
          </p>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{activity.time}</span>
          </div>
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-current opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
    </div>
  );
}

function getActivityName(type: string): string {
  switch (type) {
    case "hosting":
      return "Hospedagem";
    case "account":
      return "Conta";
    case "security":
      return "Segurança";
    default:
      return "Atividade";
  }
}

export async function RecentActivities({
  searchParams,
}: {
  searchParams?: { page?: string; type?: string };
}) {
  const user = await getUser();

  if (!user) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-background to-muted/30">
        <CardHeader className="border-b border-border/40 pb-6 bg-gradient-to-r from-background to-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Atividades Recentes
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                Acompanhe suas ações e atualizações em tempo real
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              Faça login para ver suas atividades recentes.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPage = Number(searchParams?.page) || 1;
  const activeType = searchParams?.type || "all";
  const itemsPerPage = 6;
  const offset = (currentPage - 1) * itemsPerPage;

  // Get total count for pagination
  const whereCondition = eq(pgLog.userId, user.id);
  const [totalResult] = await db
    .select({ count: count() })
    .from(pgLog)
    .where(whereCondition);
  const totalItems = totalResult.count;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Fetch recent logs for the current user with pagination
  const logs = await db.query.pgLog.findMany({
    where: whereCondition,
    orderBy: desc(pgLog.createdAt),
    limit: itemsPerPage,
    offset: offset,
  });

  const activities = logs.map((log) => {
    const severity = log.severity as keyof typeof severityToColor;
    const colors = severityToColor[severity] || severityToColor.info;

    return {
      id: log.id,
      type: log.type,
      severity: log.severity,
      title: log.title,
      description: log.description,
      time: formatDistanceToNow(log.createdAt, {
        addSuffix: true,
        locale: ptBR,
      }),
      icon: getActivityIcon(log.type, log.severity),
      colors,
    };
  });

  // Filter activities by type
  const getFilteredActivities = (type: string) => {
    return type === "all"
      ? activities
      : activities.filter((activity) => activity.type === type);
  };

  const renderActivitiesList = (activityList: typeof activities) => {
    if (activityList.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">
            Nenhuma atividade encontrada
          </h3>
          <p className="text-muted-foreground">
            {activeType === "all"
              ? "Suas atividades aparecerão aqui assim que você começar a usar a plataforma."
              : `Nenhuma atividade de ${activeType} encontrada.`}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {activityList.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>
    );
  };

  return (
    <div className="relative opacity-50 pointer-events-none select-none h-full">
      <Card className="h-full border-0 shadow-xl bg-gradient-to-br from-background to-muted/30 overflow-hidden flex flex-col">
        <CardHeader className="border-b border-border/40 pb-6 bg-gradient-to-r from-background to-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Atividades Recentes
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                Acompanhe suas ações e atualizações em tempo real
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-medium">
              {totalItems} {totalItems === 1 ? "atividade" : "atividades"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 flex-1 flex flex-col">
        <Suspense fallback={<div>Carregando...</div>}>
          <Tabs value={activeType} className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="grid grid-cols-4 bg-muted/50 p-1 rounded-xl">
                <TabsTrigger
                  value="all"
                  className="flex items-center gap-2 rounded-lg data-[state=active]:shadow-sm transition-all duration-200"
                  asChild
                >
                  <Link
                    prefetch
                    className="all:unset"
                    href="?type=all"
                    scroll={false}
                  >
                    <Filter className="h-3 w-3" />
                    <span className="hidden sm:inline">Todos</span>
                  </Link>
                </TabsTrigger>
                <TabsTrigger
                  value="hosting"
                  className="flex items-center gap-2 rounded-lg data-[state=active]:shadow-sm transition-all duration-200"
                  asChild
                >
                  <Link prefetch href="?type=hosting" scroll={false}>
                    <Server className="h-3 w-3" />
                    <span className="hidden sm:inline">Hospedagem</span>
                  </Link>
                </TabsTrigger>
                <TabsTrigger
                  value="account"
                  className="flex items-center gap-2 rounded-lg data-[state=active]:shadow-sm transition-all duration-200"
                  asChild
                >
                  <Link prefetch href="?type=account" scroll={false}>
                    <User className="h-3 w-3" />
                    <span className="hidden sm:inline">Conta</span>
                  </Link>
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="flex items-center gap-2 rounded-lg data-[state=active]:shadow-sm transition-all duration-200"
                  asChild
                >
                  <Link prefetch href="?type=security" scroll={false}>
                    <Shield className="h-3 w-3" />
                    <span className="hidden sm:inline">Segurança</span>
                  </Link>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="mt-0">
              {renderActivitiesList(getFilteredActivities("all"))}
            </TabsContent>

            <TabsContent value="hosting" className="mt-0">
              {renderActivitiesList(getFilteredActivities("hosting"))}
            </TabsContent>

            <TabsContent value="account" className="mt-0">
              {renderActivitiesList(getFilteredActivities("account"))}
            </TabsContent>

            <TabsContent value="security" className="mt-0">
              {renderActivitiesList(getFilteredActivities("security"))}
            </TabsContent>
          </Tabs>

          {/* Modern Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 pt-6 border-t border-border/40">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={
                        currentPage > 1
                          ? `?page=${currentPage - 1}${activeType !== "all" ? `&type=${activeType}` : ""}`
                          : undefined
                      }
                      className={
                        currentPage <= 1
                          ? "pointer-events-none opacity-50"
                          : "hover:bg-primary/10 hover:text-primary"
                      }
                    />
                  </PaginationItem>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href={`?page=${pageNum}${activeType !== "all" ? `&type=${activeType}` : ""}`}
                          isActive={currentPage === pageNum}
                          className={
                            currentPage === pageNum
                              ? "bg-primary text-primary-foreground hover:bg-primary/90"
                              : "hover:bg-primary/10 hover:text-primary"
                          }
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          href={`?page=${totalPages}${activeType !== "all" ? `&type=${activeType}` : ""}`}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href={
                        currentPage < totalPages
                          ? `?page=${currentPage + 1}${activeType !== "all" ? `&type=${activeType}` : ""}`
                          : undefined
                      }
                      className={
                        currentPage >= totalPages
                          ? "pointer-events-none opacity-50"
                          : "hover:bg-primary/10 hover:text-primary"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              <div className="text-center mt-4">
                <p className="text-xs text-muted-foreground">
                  Mostrando {Math.min(itemsPerPage, activities.length)} de{" "}
                  {totalItems} atividades
                </p>
              </div>
            </div>
          )}
        </Suspense>
      </CardContent>
    </Card>
    </div>
  );
}
