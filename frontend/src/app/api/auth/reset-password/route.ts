import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "@/lib/auth/scrypt";
import {
  markPasswordResetTokenAsUsed,
  validatePasswordResetToken,
} from "@/lib/auth/tokens";
import { db } from "@/lib/db";
import { pgUser } from "@/lib/db/schema";
import { errorHandler } from "@/lib/error-handler";
import { AppError } from "@/lib/errors";

const resetPasswordSchema = z
  .object({
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
    password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
    token: z.string().min(1, "Token é obrigatório"),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = resetPasswordSchema.parse(body);

    // Validate the reset token
    const resetToken = await validatePasswordResetToken(token);
    if (!resetToken) {
      throw new AppError("Token inválido ou expirado", 400);
    }

    // Hash the new password
    const hashedPassword = await hash(password);

    // Update user's password
    await db
      .update(pgUser)
      .set({
        emailVerified: new Date(),
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(pgUser.id, resetToken.userId));

    // Mark token as used
    await markPasswordResetTokenAsUsed(token);

    return NextResponse.json({
      message: "Senha redefinida com sucesso",
    });
  } catch (error) {
    return errorHandler(error);
  }
}
