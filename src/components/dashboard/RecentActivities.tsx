import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BadgeAlert as Alert,
  Settings,
  UserPlus,
  FileText,
  Server,
  Globe,
} from "lucide-react";

export function RecentActivities() {
  const activities = [
    {
      id: 1,
      type: "security",
      title: "Login from new device",
      description: "Windows PC - Chrome Browser",
      time: "Today, 10:32 AM",
      icon: Alert,
    },
    {
      id: 2,
      type: "account",
      title: "Profile information updated",
      description: "Changed email address",
      time: "Yesterday, 4:15 PM",
      icon: Settings,
    },
    {
      id: 3,
      type: "hosting",
      title: "New subdomain created",
      description: "blog.mycompany.com",
      time: "Apr 28, 2025, 2:45 PM",
      icon: Globe,
    },
    {
      id: 4,
      type: "account",
      title: "Added new team member",
      description: "sarah@example.com with editor permissions",
      time: "Apr 25, 2025, 11:22 AM",
      icon: UserPlus,
    },
    {
      id: 5,
      type: "billing",
      title: "Invoice #INV-2025-04-001 paid",
      description: "$24.99 via Credit Card",
      time: "Apr 15, 2025, 9:30 AM",
      icon: FileText,
    },
    {
      id: 6,
      type: "hosting",
      title: "Website backup created",
      description: "Automatic monthly backup",
      time: "Apr 01, 2025, 3:00 AM",
      icon: Server,
    },
  ];

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
              {activities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex gap-3 pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div
                      className={`
                      h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0
                      ${activity.type === "security" ? "bg-red-100 text-red-500 dark:bg-red-900/20" : ""}
                      ${activity.type === "account" ? "bg-blue-100 text-blue-500 dark:bg-blue-900/20" : ""}
                      ${activity.type === "hosting" ? "bg-green-100 text-green-500 dark:bg-green-900/20" : ""}
                      ${activity.type === "billing" ? "bg-purple-100 text-purple-500 dark:bg-purple-900/20" : ""}
                    `}
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
              })}
            </div>
          </TabsContent>

          <TabsContent value="hosting">
            <div className="space-y-4">
              {activities
                .filter((activity) => activity.type === "hosting")
                .map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div
                      key={activity.id}
                      className="flex gap-3 pb-4 border-b last:border-0 last:pb-0"
                    >
                      <div className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 bg-green-100 text-green-500 dark:bg-green-900/20">
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
                })}
            </div>
          </TabsContent>

          <TabsContent value="account">
            <div className="space-y-4">
              {activities
                .filter((activity) => activity.type === "account")
                .map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div
                      key={activity.id}
                      className="flex gap-3 pb-4 border-b last:border-0 last:pb-0"
                    >
                      <div className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100 text-blue-500 dark:bg-blue-900/20">
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
                })}
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-4">
              {activities
                .filter((activity) => activity.type === "security")
                .map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div
                      key={activity.id}
                      className="flex gap-3 pb-4 border-b last:border-0 last:pb-0"
                    >
                      <div className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 bg-red-100 text-red-500 dark:bg-red-900/20">
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
                })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
