import {
  ArrowUpRight,
  CreditCard,
  Globe,
  HardDrive,
  Users,
} from "lucide-react";
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

export function OrganizationOverview({ user }: { user: User }) {
  const { organization } = user;
  const { members } = organization || [];

  return (
    <div className="space-y-6">
      {/* Organization Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Total de Membros
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {organization.members?.length || 0}
            </div>
            <p className="mt-1 text-muted-foreground text-xs">
              Membros da organização
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Domínios Ativos
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {organization.domains.length || 0}
            </div>
            <p className="mt-1 text-muted-foreground text-xs">
              Total de domínios da sua organização
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Uso de Armazenamento
            </CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">75 GB</div>{" "}
            {/* TODO: Replace with real data */}
            <p className="mt-1 text-muted-foreground text-xs">
              of 100 GB quota
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Nome da Organização
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{organization.name}</div>
            <p className="mt-1 text-muted-foreground text-xs">
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
              <CardTitle>Assinatura e Uso</CardTitle>
              <CardDescription>
                Detalhes do plano atual e uso de recursos.
              </CardDescription>
            </div>
            <Button>
              Gerenciar Assinatura
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
              <p className="text-muted-foreground text-sm">
                Ativo até 30 de Maio, 2026 {/* TODO: Replace with real data */}
              </p>
            </div>
            <Button variant="outline">Atualizar Plano</Button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-sm">Uso de Armazenamento</p>
                  <p className="text-muted-foreground text-sm">
                    75 GB de 100 GB usados {/* TODO: Replace with real data */}
                  </p>
                </div>
                <span className="font-medium text-sm">75%</span>
              </div>
              <Progress className="h-2" value={75} />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-sm">Membros da Equipe</p>
                  <p className="text-muted-foreground text-sm">
                    {organization.members?.length || 0} de 20{" "}
                    {/* TODO: Replace with real data for limit */}
                  </p>
                </div>
                <span className="font-medium text-sm">
                  {Math.round(((organization.members?.length || 0) / 20) * 100)}
                  % {/* TODO: Replace with real data for limit */}
                </span>
              </div>
              <Progress
                className="h-2"
                value={Math.round(
                  ((organization.members?.length || 0) / 20) * 100
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
