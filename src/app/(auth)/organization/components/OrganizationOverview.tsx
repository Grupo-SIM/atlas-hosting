import { UserPlanBadge } from "@/components/dashboard/WelcomeHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { User } from "@/lib/db/schema/tables/user";
import { formatDate } from "@/lib/utils";
import {
  ArrowUpRight,
  CreditCard,
  Globe,
  HardDrive,
  Users,
} from "lucide-react";

export function OrganizationOverview({ user }: { user: User }) {
  const { organization } = user;
  const { members } = organization || [];

  return (
    <div className="space-y-6">
      {/* Organization Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Membros
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Membros da organização
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Domínios Ativos
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organization.domains.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de domínios da sua organização
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Uso de armazenamento
            </CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75 GB</div>
            <p className="text-xs text-muted-foreground mt-1">
              of 100 GB quota
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nome da organização
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization.name}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registrada em {formatDate(organization.createdAt)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription & Usage */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Subscription & Usage</CardTitle>
              <CardDescription>
                Current plan details and resource usage
              </CardDescription>
            </div>
            <Button>
              Manage Subscription
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">
                <UserPlanBadge user={user} />
              </div>
              <p className="text-sm text-muted-foreground">
                Active until May 30, 2026
              </p>
            </div>
            <Button variant="outline">Atualizar Plano</Button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Uso de Armazenamento</p>
                  <p className="text-sm text-muted-foreground">
                    75 GB of 100 GB used
                  </p>
                </div>
                <span className="text-sm font-medium">75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Membros da Equipe</p>
                  <p className="text-sm text-muted-foreground">
                    {members?.length || 0} of 20 seats used
                  </p>
                </div>
                <span className="text-sm font-medium">
                  {Math.round(((members?.length || 0) / 75) * 100)}%
                </span>
              </div>
              <Progress
                value={Math.round(((members?.length || 0) / 75) * 100)}
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
