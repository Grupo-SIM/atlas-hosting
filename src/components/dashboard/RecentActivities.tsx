import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { count, desc, eq } from "drizzle-orm";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Info,
  type LucideIcon,
  Server,
  Shield,
  Sparkles,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgLog } from "@/lib/db/schema";

// Map severity to icons
const severityToIcon: Record<string, LucideIcon> = {
  danger: XCircle,
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
};

// Map log types to icons
const typeToIcon: Record<string, LucideIcon> = {
  account: User,
  hosting: Server,
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
  danger: {
    badge:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
    glow: "shadow-red-200/50 dark:shadow-red-900/30",
    gradient:
      "bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950/30 dark:to-rose-950/30",
    icon: "text-red-600 dark:text-red-400",
  },
  info: {
    badge:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
    glow: "shadow-blue-200/50 dark:shadow-blue-900/30",
    gradient:
      "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30",
    icon: "text-blue-600 dark:text-blue-400",
  },
  success: {
    badge:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
    glow: "shadow-emerald-200/50 dark:shadow-emerald-900/30",
    gradient:
      "bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950/30 dark:to-green-950/30",
    icon: "text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    badge:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
    glow: "shadow-amber-200/50 dark:shadow-amber-900/30",
    gradient:
      "bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/30",
    icon: "text-amber-600 dark:text-amber-400",
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
      className={`group relative rounded-2xl border border-border/40 p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-border/60 hover:shadow-lg ${activity.colors.gradient} ${activity.colors.glow}backdrop-blur-sm`}
    >
      {/* Hover effect overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-primary/10" />

      <div className="relative flex gap-4">
        {/* Icon with modern styling */}
        <div
          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-white/50 bg-white/80 shadow-sm backdrop-blur-sm transition-all duration-300 group-hover:shadow-md dark:border-white/20 dark:bg-white/10 ${activity.colors.icon}
        `}
        >
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between gap-3">
            <h3 className="font-semibold text-foreground text-sm transition-colors duration-200 group-hover:text-primary">
              {activity.title}
            </h3>
            <div className="flex flex-shrink-0 items-center gap-2">
              <Badge
                className={`font-medium text-xs ${activity.colors.badge}`}
                variant="outline"
              >
                {getActivityName(activity.type)}
              </Badge>
            </div>
          </div>

          <p className="mb-3 text-muted-foreground text-sm leading-relaxed">
            {activity.description}
          </p>

          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Clock className="h-3 w-3" />
            <span>{activity.time}</span>
          </div>
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-current opacity-20 transition-opacity duration-300 group-hover:opacity-40" />
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
      <Card className="border-0 bg-gradient-to-br from-background to-muted/30 shadow-xl">
        <CardHeader className="border-border/40 border-b bg-gradient-to-r from-background to-muted/20 pb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-2">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text font-bold text-transparent text-xl">
                Atividades Recentes
              </CardTitle>
              <CardDescription className="mt-1 text-sm">
                Acompanhe suas ações e atualizações em tempo real
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
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
    limit: itemsPerPage,
    offset,
    orderBy: desc(pgLog.createdAt),
    where: whereCondition,
  });

  const activities = logs.map(log => {
    const severity = log.severity as keyof typeof severityToColor;
    const colors = severityToColor[severity] || severityToColor.info;

    return {
      colors,
      description: log.description,
      icon: getActivityIcon(log.type, log.severity),
      id: log.id,
      severity: log.severity,
      time: formatDistanceToNow(log.createdAt, {
        addSuffix: true,
        locale: ptBR,
      }),
      title: log.title,
      type: log.type,
    };
  });

  // Filter activities by type
  const getFilteredActivities = (type: string) => {
    return type === "all"
      ? activities
      : activities.filter(activity => activity.type === type);
  };

  const renderActivitiesList = (activityList: typeof activities) => {
    if (activityList.length === 0) {
      return (
        <div className="py-12 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30">
            <Sparkles className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mb-2 font-semibold text-lg">
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
        {activityList.map(activity => (
          <ActivityCard activity={activity} key={activity.id} />
        ))}
      </div>
    );
  };

  return (
    <div className="pointer-events-none relative h-full select-none opacity-50">
      <Card className="flex h-full flex-col overflow-hidden border-0 bg-gradient-to-br from-background to-muted/30 shadow-xl">
        <CardHeader className="border-border/40 border-b bg-gradient-to-r from-background to-muted/20 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-2">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text font-bold text-transparent text-xl">
                  Atividades Recentes
                </CardTitle>
                <CardDescription className="mt-1 text-sm">
                  Acompanhe suas ações e atualizações em tempo real
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="font-medium text-xs" variant="outline">
                {totalItems} {totalItems === 1 ? "atividade" : "atividades"}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col pt-6">
          <Suspense fallback={<div>Carregando...</div>}>
            <Tabs className="w-full" value={activeType}>
              <div className="mb-6 flex items-center justify-between">
                <TabsList className="grid grid-cols-4 rounded-xl bg-muted/50 p-1">
                  <TabsTrigger
                    asChild
                    className="flex items-center gap-2 rounded-lg transition-all duration-200 data-[state=active]:shadow-sm"
                    value="all"
                  >
                    <Link
                      className="all:unset"
                      href="?type=all"
                      prefetch
                      scroll={false}
                    >
                      <Filter className="h-3 w-3" />
                      <span className="hidden sm:inline">Todos</span>
                    </Link>
                  </TabsTrigger>
                  <TabsTrigger
                    asChild
                    className="flex items-center gap-2 rounded-lg transition-all duration-200 data-[state=active]:shadow-sm"
                    value="hosting"
                  >
                    <Link href="?type=hosting" prefetch scroll={false}>
                      <Server className="h-3 w-3" />
                      <span className="hidden sm:inline">Hospedagem</span>
                    </Link>
                  </TabsTrigger>
                  <TabsTrigger
                    asChild
                    className="flex items-center gap-2 rounded-lg transition-all duration-200 data-[state=active]:shadow-sm"
                    value="account"
                  >
                    <Link href="?type=account" prefetch scroll={false}>
                      <User className="h-3 w-3" />
                      <span className="hidden sm:inline">Conta</span>
                    </Link>
                  </TabsTrigger>
                  <TabsTrigger
                    asChild
                    className="flex items-center gap-2 rounded-lg transition-all duration-200 data-[state=active]:shadow-sm"
                    value="security"
                  >
                    <Link href="?type=security" prefetch scroll={false}>
                      <Shield className="h-3 w-3" />
                      <span className="hidden sm:inline">Segurança</span>
                    </Link>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent className="mt-0" value="all">
                {renderActivitiesList(getFilteredActivities("all"))}
              </TabsContent>

              <TabsContent className="mt-0" value="hosting">
                {renderActivitiesList(getFilteredActivities("hosting"))}
              </TabsContent>

              <TabsContent className="mt-0" value="account">
                {renderActivitiesList(getFilteredActivities("account"))}
              </TabsContent>

              <TabsContent className="mt-0" value="security">
                {renderActivitiesList(getFilteredActivities("security"))}
              </TabsContent>
            </Tabs>

            {/* Modern Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 border-border/40 border-t pt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        className={
                          currentPage <= 1
                            ? "pointer-events-none opacity-50"
                            : "hover:bg-primary/10 hover:text-primary"
                        }
                        href={
                          currentPage > 1
                            ? `?page=${currentPage - 1}${activeType !== "all" ? `&type=${activeType}` : ""}`
                            : undefined
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
                            className={
                              currentPage === pageNum
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "hover:bg-primary/10 hover:text-primary"
                            }
                            href={`?page=${pageNum}${activeType !== "all" ? `&type=${activeType}` : ""}`}
                            isActive={currentPage === pageNum}
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
                            className="hover:bg-primary/10 hover:text-primary"
                            href={`?page=${totalPages}${activeType !== "all" ? `&type=${activeType}` : ""}`}
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        className={
                          currentPage >= totalPages
                            ? "pointer-events-none opacity-50"
                            : "hover:bg-primary/10 hover:text-primary"
                        }
                        href={
                          currentPage < totalPages
                            ? `?page=${currentPage + 1}${activeType !== "all" ? `&type=${activeType}` : ""}`
                            : undefined
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>

                <div className="mt-4 text-center">
                  <p className="text-muted-foreground text-xs">
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
