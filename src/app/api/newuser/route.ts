import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { pgOrganization, pgUser, pgWallet } from "@/lib/db/schema";

export async function GET() {
  // Buscar usuário diretamente da sessão do NextAuth, sem usar getUser() que redireciona
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Buscar usuário do banco de dados
  const user = await db.query.pgUser.findFirst({
    where: eq(pgUser.id, session.user.id),
  });

  if (!user) {
    redirect("/login");
  }

  // Se o usuário já tem organização, redirecionar direto para o dashboard
  if (user.organizationId) {
    redirect("/home");
  }

  // Criar organização se não existir
  const walletResult = await db
    .insert(pgWallet)
    .values({
      balance: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  const { id: walletId } = walletResult[0];

  const newOrg = await db
    .insert(pgOrganization)
    .values({
      name: user.name,
      ownerId: user.id,
      walletId,
    })
    .returning();

  await db
    .update(pgUser)
    .set({
      organizationId: newOrg[0].id,
    })
    .where(eq(pgUser.id, user.id));

  // Redirecionar para o dashboard após criar a organização
  redirect("/home");
}
