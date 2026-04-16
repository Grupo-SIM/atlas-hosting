import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { pgUser } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createPasswordResetToken, generateVerificationCode } from "@/lib/auth/tokens";
import { sendPasswordResetEmail } from "@/lib/email/service";
import { errorHandler } from "@/lib/error-handler";

const requestPasswordResetSchema = z.object({
  email: z.string().email("Email inválido"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = requestPasswordResetSchema.parse(body);

    // Find user by email
    const user = await db.query.pgUser.findFirst({
      where: eq(pgUser.email, email.toLowerCase()),
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: "Se o email existe em nosso sistema, você receberá um link de redefinição de senha.",
      });
    }

    // Create password reset token
    const resetToken = await createPasswordResetToken(user.id);

    // Send password reset email
    await sendPasswordResetEmail(
      user.email,
      user.name,
      resetToken.token
    );

    return NextResponse.json({
      message: "Se o email existe em nosso sistema, você receberá um link de redefinição de senha.",
    });
  } catch (error) {
    return errorHandler(error);
  }
}
