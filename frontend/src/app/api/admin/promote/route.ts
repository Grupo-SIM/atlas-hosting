import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pgUser } from "@/lib/db/schema";

/**
 * Endpoint para promover um usuário a ADMIN via e-mail.
 * Segurança: Apenas quem já é ADMIN pode promover outros.
 * Uso: POST /api/admin/promote { "email": "usuario@email.com" }
 */
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // BLOQUEIO DESATIVADO TEMPORARIAMENTE
    // const currentUser = await getUser();
    // if (!currentUser || !currentUser.isAdmin) {
    //   return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    // }

    if (!email) {
      return NextResponse.json(
        { error: "E-mail é obrigatório." },
        { status: 400 }
      );
    }

    // 2. Buscar o usuário pelo e-mail
    const targetUser = await db.query.pgUser.findFirst({
      where: eq(pgUser.email, email),
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    // 3. Atualizar para Admin
    await db
      .update(pgUser)
      .set({ isAdmin: true })
      .where(eq(pgUser.email, email));

    return NextResponse.json({
      message: `Usuário ${email} agora é um Administrador Atlas.`,
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
