import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Server,
  Info,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Shield,
  User,
  type LucideIcon,
} from "lucide-react";
import { db } from "@/lib/db";
import { pgLog } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cookies } from "next/headers";

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

// Map severity to colors
const severityToColor = {
  info: "bg-blue-100 text-blue-500 dark:bg-blue-900/20",
  warning: "bg-amber-100 text-amber-500 dark:bg-amber-900/20",
  danger: "bg-red-100 text-red-500 dark:bg-red-900/20",
  success: "bg-green-100 text-green-500 dark:bg-green-900/20",
};

export async function RecentActivities() {
  const user = await getUser();

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
          <CardDescription>Ações e atualizações mais recentes</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Faça login para ver suas atividades recentes.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Fetch recent logs for the current user
  const logs = await db.query.pgLog.findMany({
    where: eq(pgLog.userId, user.id),
    orderBy: desc(pgLog.createdAt),
    limit: 20,
  });

  const activities = logs.map((log) => ({
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
    colorClass:
      severityToColor[log.severity as keyof typeof severityToColor] ||
      severityToColor.info,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
        <CardDescription>Ações e atualizações mais recentes</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="hosting">Hospedagem</TabsTrigger>
            <TabsTrigger value="account">Conta</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="space-y-4">
              {activities.length === 0 ? (
                <div className="text-center py-8">
                  <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma atividade encontrada.
                  </p>
                </div>
              ) : (
                activities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div
                      key={activity.id}
                      className="flex gap-3 pb-4 border-b last:border-0 last:pb-0"
                    >
                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 ${activity.colorClass}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="font-medium">{activity.title}</p>
                          <span className="text-xs text-muted-foreground pl-2">
                            {activity.time}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="hosting">
            <div className="space-y-4">
              {activities.filter((activity) => activity.type === "hosting")
                .length === 0 ? (
                <div className="text-center py-8">
                  <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma atividade de hospedagem encontrada.
                  </p>
                </div>
              ) : (
                activities
                  .filter((activity) => activity.type === "hosting")
                  .map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div
                        key={activity.id}
                        className="flex gap-3 pb-4 border-b last:border-0 last:pb-0"
                      >
                        <div
                          className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 ${activity.colorClass}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="font-medium">{activity.title}</p>
                            <span className="text-xs text-muted-foreground pl-2">
                              {activity.time}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {activity.description}
                          </p>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </TabsContent>

          <TabsContent value="account">
            <div className="space-y-4">
              {activities.filter((activity) => activity.type === "account")
                .length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma atividade de conta encontrada.
                  </p>
                </div>
              ) : (
                activities
                  .filter((activity) => activity.type === "account")
                  .map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div
                        key={activity.id}
                        className="flex gap-3 pb-4 border-b last:border-0 last:pb-0"
                      >
                        <div
                          className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 ${activity.colorClass}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="font-medium">{activity.title}</p>
                            <span className="text-xs text-muted-foreground pl-2">
                              {activity.time}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {activity.description}
                          </p>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-4">
              {activities.filter((activity) => activity.type === "security")
                .length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma atividade de segurança encontrada.
                  </p>
                </div>
              ) : (
                activities
                  .filter((activity) => activity.type === "security")
                  .map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div
                        key={activity.id}
                        className="flex gap-3 pb-4 border-b last:border-0 last:pb-0"
                      >
                        <div
                          className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 ${activity.colorClass}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="font-medium">{activity.title}</p>
                            <span className="text-xs text-muted-foreground pl-2">
                              {activity.time}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {activity.description}
                          </p>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
