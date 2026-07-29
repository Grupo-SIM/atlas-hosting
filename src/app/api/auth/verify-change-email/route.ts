import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  markEmailVerificationTokenAsUsed,
  validateChangeEmailToken,
} from "@/lib/auth/tokens";
import { db } from "@/lib/db";
import { pgUser } from "@/lib/db/schema";
import { sendNotificationEmail } from "@/lib/email/service";
import { errorHandler } from "@/lib/error-handler";
import { AppError } from "@/lib/errors";

const verifyChangeEmailSchema = z.object({
  email: z.string().email("Email inválido"),
  token: z.string().min(1, "Token é obrigatório"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, email } = verifyChangeEmailSchema.parse(body);

    // Validate the change email token
    const changeEmailToken = await validateChangeEmailToken(token, email);
    if (!changeEmailToken) {
      throw new AppError("Token inválido ou expirado", 400);
    }

    // Get the user
    const [user] = await db
      .select()
      .from(pgUser)
      .where(eq(pgUser.id, changeEmailToken.userId))
      .limit(1);

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    // Store the old email for notification
    const oldEmail = user.email;

    // Update the user's email
    await db
      .update(pgUser)
      .set({
        email,
        emailVerified: new Date(), // Mark as verified since they verified the new email
      })
      .where(eq(pgUser.id, user.id));

    // Mark the token as used
    await markEmailVerificationTokenAsUsed(token);

    // Send notification email to the old email address
    await sendNotificationEmail(
      oldEmail,
      user.name || "Usuário",
      "Atlas Hosting",
      "Email alterado com sucesso",
      `Seu endereço de email foi alterado com sucesso de ${oldEmail} para ${email}. Se você não fez esta alteração, entre em contato conosco imediatamente.`,
      "info",
      undefined,
      undefined,
      "Esta é uma notificação automática para sua segurança."
    );

    return NextResponse.json({
      message: "Email alterado com sucesso",
      newEmail: email,
    });
  } catch (error) {
    return errorHandler(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      throw new AppError("Token e email são obrigatórios", 400);
    }

    // Validate the change email token
    const changeEmailToken = await validateChangeEmailToken(token, email);
    if (!changeEmailToken) {
      throw new AppError("Token inválido ou expirado", 400);
    }

    return NextResponse.json({
      email,
      userId: changeEmailToken.userId,
      valid: true,
    });
  } catch (error) {
    return errorHandler(error);
  }
}
