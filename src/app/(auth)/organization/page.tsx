"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { OrganizationOverview } from "./components/OrganizationOverview";
import { MemberManagement } from "./components/MemberManagement";
import { InviteMemberDialog } from "./components/InviteMemberDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Users, Settings, Shield } from "lucide-react";

export default function OrganizationPage() {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Organization Management
          </h1>
          <nav className="flex gap-1 text-sm text-muted-foreground">
            <span>Dashboard</span>
            <span>/</span>
            <span>Organization Management</span>
          </nav>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setIsInviteDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Organization Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OrganizationOverview />
        </TabsContent>

        <TabsContent value="members">
          <MemberManagement />
        </TabsContent>

        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>
                Manage organization roles and their associated permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Role cards */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <div>
                        <CardTitle className="text-base">
                          Administrator
                        </CardTitle>
                        <CardDescription>
                          Full access to all features
                        </CardDescription>
                      </div>
                      <Shield className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2">
                        <li>• Manage organization settings</li>
                        <li>• Invite and remove members</li>
                        <li>• Manage roles and permissions</li>
                        <li>• Access billing and subscriptions</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <div>
                        <CardTitle className="text-base">Developer</CardTitle>
                        <CardDescription>
                          Technical access and deployments
                        </CardDescription>
                      </div>
                      <Users className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2">
                        <li>• Deploy applications</li>
                        <li>• Access development tools</li>
                        <li>• View team members</li>
                        <li>• Limited billing access</li>
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
              {/* Audit log entries would go here */}
              <p className="text-muted-foreground">
                No audit log entries to display.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <InviteMemberDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
      />
    </div>
  );
}
