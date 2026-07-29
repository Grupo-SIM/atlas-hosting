import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { desc, eq } from "drizzle-orm";
import { ArrowLeft, CheckCircle, UserCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/db";
import { pgUser } from "@/lib/db/schema";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AffiliateDetailsPage({ params }: PageProps) {
  const { id } = await params;

  const affiliate = await db.query.pgUser.findFirst({
    where: eq(pgUser.id, id),
  });

  if (!affiliate) {
    notFound();
  }

  const referrals = await db.query.pgUser.findMany({
    orderBy: [desc(pgUser.createdAt)],
    where: eq(pgUser.referrerId, affiliate.id),
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button asChild size="icon" variant="ghost">
          <Link href="/admin/affiliates">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="font-bold text-3xl tracking-tight">
            Detalhes: {affiliate.name}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Indicações realizadas por {affiliate.email}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm uppercase">
              Total de Indicações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{referrals.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários Indicados</CardTitle>
          <CardDescription>
            Lista de contas criadas através deste afiliado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Data de Registro</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-4 w-4 text-muted-foreground" />
                        {user.name}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {format(new Date(user.createdAt), "PPP", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      {!user.deletedAt ? (
                        <Badge
                          className="bg-green-500/10 text-green-500"
                          variant="outline"
                        >
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Ativo
                        </Badge>
                      ) : (
                        <Badge
                          className="bg-red-500/10 text-red-500"
                          variant="outline"
                        >
                          <XCircle className="mr-1 h-3 w-3" />
                          Inativo
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {referrals.length === 0 && (
                  <TableRow>
                    <TableCell
                      className="py-10 text-center text-muted-foreground"
                      colSpan={4}
                    >
                      Nenhuma indicação encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
