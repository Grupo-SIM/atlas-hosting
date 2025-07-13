import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { pgUser } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { validateEmailVerificationToken, markEmailVerificationTokenAsUsed } from "@/lib/auth/tokens";
import { AppError } from "@/lib/errors";
import { errorHandler } from "@/lib/error-handler";

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = verifyEmailSchema.parse(body);

    // Validate the verification token
    const verificationToken = await validateEmailVerificationToken(token);
    if (!verificationToken) {
      throw new AppError("Token inválido ou expirado", 400);
    }

    // Update user's email verification status
    await db
      .update(pgUser)
      .set({
        emailVerified: new Date(),
        email: verificationToken.email, // In case they're verifying a new email
        updatedAt: new Date(),
      })
      .where(eq(pgUser.id, verificationToken.userId));

    // Mark token as used
    await markEmailVerificationTokenAsUsed(token);

    return NextResponse.json({
      message: "Email verificado com sucesso",
    });
  } catch (error) {
    return errorHandler(error);
  }
}
