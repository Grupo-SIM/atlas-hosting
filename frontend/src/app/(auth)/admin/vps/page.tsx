import { Cpu, HardDrive, Plus, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { getAllUsersAction, getAllVpsServersAction } from "@/app/vps-actions";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AdminDeleteVpsButton from "@/components/vps/AdminDeleteVpsButton";
import AdminVpsAddForm from "@/components/vps/AdminVpsAddForm";
import CopyTokenButton from "@/components/vps/CopyTokenButton";
import { getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const HEARTBEAT_TIMEOUT_MS = 5 * 60 * 1000;

function isServerLive(s: {
  status: string | null;
  lastHeartbeat: Date | null;
}) {
  return (
    s.status === "active" &&
    !!s.lastHeartbeat &&
    Date.now() - new Date(s.lastHeartbeat).getTime() < HEARTBEAT_TIMEOUT_MS
  );
}

export default async function AdminVpsPage() {
  const admin = await getUser();

  // Segurança extra em nível de servidor
  if (!admin?.isAdmin) {
    redirect("/home");
  }

  const servers = await getAllVpsServersAction();
  const users = await getAllUsersAction();

  return (
    <div className="flex-1 space-y-6 p-4 pt-4 md:p-8 md:pt-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-bold text-3xl tracking-tight">
            Administração de VPS
          </h2>
          <p className="text-muted-foreground">
            Gerencie todos os nós e entregue novos servidores aos clientes.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 py-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="font-bold text-primary text-sm">
            Acesso Restrito: Admin
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-2 border-primary/20 shadow-lg lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Entregar Nova VPS
            </CardTitle>
            <CardDescription>
              Vincule um novo IP de servidor a uma conta de usuário.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminVpsAddForm users={users} />
          </CardContent>
        </Card>

        {/* Lista Global de Servidores */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Nós Registrados ({servers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="transition-colors hover:bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Servidor
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Dono
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      IP / Token
                    </th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {servers.map((s: any) => (
                    <tr
                      className="border-b transition-colors hover:bg-muted/50"
                      key={s.id}
                    >
                      <td className="p-4 align-middle font-medium">
                        <div className="flex items-center gap-2">
                          <div className="rounded-md bg-muted p-2">
                            <Cpu className="h-4 w-4" />
                          </div>
                          {s.name}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-semibold">{s.user?.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {s.user?.email}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <Badge
                          variant={isServerLive(s) ? "action" : "secondary"}
                        >
                          {isServerLive(s) ? "Ativa" : "Inativa"}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle font-mono text-[10px]">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">IP:</span>{" "}
                            {s.ip}
                          </div>
                          <div className="group flex items-center gap-1">
                            <span className="text-muted-foreground">
                              Token:
                            </span>
                            <CopyTokenButton token={s.token} />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right align-middle">
                        <AdminDeleteVpsButton vpsId={s.id} vpsName={s.name} />
                      </td>
                    </tr>
                  ))}
                  {servers.length === 0 && (
                    <tr>
                      <td className="h-24 text-center" colSpan={4}>
                        Nenhum servidor cadastrado no sistema.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
