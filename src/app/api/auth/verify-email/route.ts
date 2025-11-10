import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { pgUser } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { 
  validateEmailVerificationToken, 
  validateEmailVerificationCode,
  markEmailVerificationTokenAsUsed 
} from "@/lib/auth/tokens";
import { AppError } from "@/lib/errors";
import { errorHandler } from "@/lib/error-handler";
import { createSession, generateSessionToken } from "@/lib/auth/utils";
import { cookies } from "next/headers";

const verifyEmailSchema = z.object({
  token: z.string().optional(),
  code: z.string().optional(),
  email: z.string().email().optional(),
}).refine(
  (data) => data.token || (data.code && data.email),
  {
    message: "Token ou código com email são obrigatórios",
  }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, code, email } = verifyEmailSchema.parse(body);

    let verificationToken = null;

    // Validate by token or code
    if (token) {
      verificationToken = await validateEmailVerificationToken(token);
    } else if (code && email) {
      verificationToken = await validateEmailVerificationCode(code, email);
    }

    if (!verificationToken) {
      throw new AppError("Código ou token inválido ou expirado", 400);
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
    await markEmailVerificationTokenAsUsed(verificationToken.token);

    // Create session and log user in automatically
    const sessionToken = generateSessionToken();
    await createSession(sessionToken, verificationToken.userId);

    const cookieStore = await cookies();
    cookieStore.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({
      message: "Email verificado com sucesso",
      success: true,
    });
  } catch (error) {
    return errorHandler(error);
  }
}
