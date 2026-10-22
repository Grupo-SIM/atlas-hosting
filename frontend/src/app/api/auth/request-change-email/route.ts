import { verify } from "@node-rs/argon2";
import { and, eq, ne } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { createChangeEmailToken } from "@/lib/auth/tokens";
import { db } from "@/lib/db";
import { pgUser } from "@/lib/db/schema";
import { sendChangeEmailVerificationEmail } from "@/lib/email/service";
import { errorHandler } from "@/lib/error-handler";
import { AppError } from "@/lib/errors";

const requestChangeEmailSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newEmail: z.string().email("Email inválido"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { newEmail, currentPassword } = requestChangeEmailSchema.parse(body);

    // Validate session
    const session = await auth();
    if (!session?.user?.id) {
      throw new AppError("Não autorizado", 401);
    }

    // Get current user
    const [user] = await db
      .select()
      .from(pgUser)
      .where(eq(pgUser.id, session.user.id))
      .limit(1);

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    // Check if the new email is the same as current
    if (user.email === newEmail) {
      throw new AppError("O novo email deve ser diferente do atual", 400);
    }

    // Verify current password
    if (!user.password) {
      throw new AppError("Conta não possui senha definida", 400);
    }

    const passwordValid = await verify(user.password, currentPassword);
    if (!passwordValid) {
      throw new AppError("Senha atual incorreta", 400);
    }

    // Check if the new email is already in use by another user
    const [existingUser] = await db
      .select()
      .from(pgUser)
      .where(and(eq(pgUser.email, newEmail), ne(pgUser.id, user.id)))
      .limit(1);

    if (existingUser) {
      throw new AppError("Este email já está em uso", 400);
    }

    // Create verification token for the new email
    const changeEmailToken = await createChangeEmailToken(user.id, newEmail);

    // Send verification email to the new email address
    await sendChangeEmailVerificationEmail(
      newEmail,
      user.name || "Usuário",
      user.email,
      changeEmailToken.token
    );

    return NextResponse.json({
      message: "Email de verificação enviado para o novo endereço",
      newEmail,
    });
  } catch (error) {
    return errorHandler(error);
  }
}
