"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircle, CheckCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Log } from "@/lib/db/schema/tables/log";
import type { User } from "@/lib/db/schema/tables/user";
import { MemberManagement } from "./MemberManagement";
import { OrganizationOverview } from "./OrganizationOverview";

interface OrganizationTabsProps {
  user: User;
  auditLogs?: Array<{
    log: Log;
    user: {
      id: string;
      name: string | null;
      email: string | null;
    };
  }>;
  currentUserId: string;
  organizationId: string;
  isOwner: boolean;
}

export function OrganizationTabs({
  user,
  auditLogs = [],
  currentUserId,
  organizationId,
  isOwner,
}: OrganizationTabsProps) {
  const { organization } = user;
  const members = organization?.members || []; // Ensure members is an array

  return (
    <Tabs className="space-y-6" defaultValue="overview">
      <TabsList className="h-auto flex-wrap">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        <TabsTrigger value="audit">Audit Log</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <OrganizationOverview user={user} />
      </TabsContent>

      <TabsContent value="members">
        <MemberManagement
          currentUserId={currentUserId}
          isOwner={isOwner}
          members={members}
          organizationId={organizationId}
        />
      </TabsContent>

      <TabsContent value="roles">
        <Card>
          <CardContent>
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Admin Role</CardTitle>
                    <CardDescription>
                      Full access to all organization settings and data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc space-y-1 pl-5 text-sm">
                      <li>Manage organization settings</li>
                      <li>Invite and remove members</li>
                      <li>Change member roles</li>
                      <li>View and manage billing</li>
                      <li>Create and manage all resources</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Developer Role</CardTitle>
                    <CardDescription>
                      Access to development resources, limited admin
                      capabilities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc space-y-1 pl-5 text-sm">
                      <li>Create and manage assigned resources</li>
                      <li>Deploy code and applications</li>
                      <li>Manage development environments</li>
                      <li>Limited access to organization settings</li>
                      <li>No access to billing or member management</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="audit">
        <Card>
          <CardHeader>
            <CardTitle>Audit Log</CardTitle>
            <CardDescription>
              Track important changes and actions within your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {auditLogs && auditLogs.length > 0 ? (
              <div className="space-y-4">
                {auditLogs.map(log => (
                  <div
                    className="flex items-start gap-4 rounded-lg border p-4"
                    key={log.log.id}
                  >
                    <div className="flex-shrink-0">
                      {log.log.severity === "success" && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {log.log.severity === "warning" && (
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                      )}
                      {log.log.severity === "danger" && (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      {log.log.severity === "info" && (
                        <AlertCircle className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{log.log.title}</h3>
                        <span className="text-muted-foreground text-sm">
                          {log.log.createdAt &&
                            format(log.log.createdAt, "PPp", { locale: ptBR })}
                        </span>
                      </div>
                      <p className="mt-1 text-muted-foreground text-sm">
                        {log.log.description}
                      </p>
                      <div className="mt-2 flex items-center">
                        <span className="rounded-full bg-secondary px-2 py-1 text-secondary-foreground text-xs">
                          {log.user.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No audit log entries to display.
              </p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
