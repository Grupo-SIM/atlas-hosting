import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { pgUser } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createEmailVerificationToken } from "@/lib/auth/tokens";
import { sendEmailVerificationEmail } from "@/lib/email/service";
import { errorHandler } from "@/lib/error-handler";

const resendVerificationSchema = z.object({
  email: z.string().email("Email inválido"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = resendVerificationSchema.parse(body);

    // Find user by email
    const user = await db.query.pgUser.findFirst({
      where: eq(pgUser.email, email.toLowerCase()),
    });

    // Return success even if user doesn't exist to prevent enumeration
    if (!user) {
      return NextResponse.json({
        message: "Se o email existe em nosso sistema, você receberá um link de verificação.",
      });
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json({
        message: "Este email já foi verificado.",
      });
    }

    // Create verification token
    const verificationToken = await createEmailVerificationToken(user.id, user.email);

    // Send verification email
    await sendEmailVerificationEmail(
      user.email,
      user.name,
      verificationToken.token,
      verificationToken.code
    );

    return NextResponse.json({
      message: "Email de verificação enviado.",
    });
  } catch (error) {
    return errorHandler(error);
  }
}
