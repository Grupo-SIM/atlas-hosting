import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createUser } from "@/lib/auth/utils";
import { AppLogger } from "@/lib/server/logs";
import { errorHandler } from "@/lib/error-handler";
import { db } from "@/lib/db";
import { pgUser } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const signupSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres").max(100, "A senha deve ter no máximo 100 caracteres"),
  fullName: z.string().min(1, "Nome é obrigatório").refine(
    (name) => name.split(" ").length >= 2,
    "Digite seu nome completo"
  ),
  organizationName: z.string().min(1, "Nome da organização é obrigatório"),
  referrerId: z.string().optional(),
  ref: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, organizationName, referrerId: initialReferrerId, ref } = signupSchema.parse(body);

    let referrerId = initialReferrerId;

    // Se houver um código de afiliado (ref), buscar o ID do usuário correspondente
    if (ref && !referrerId) {
      const referringUser = await db.query.pgUser.findFirst({
        where: eq(pgUser.affiliateCode, ref),
      });
      if (referringUser) {
        referrerId = referringUser.id;
      }
    }

    // Verificar se o email já existe
    const existingUser = await db.query.pgUser.findFirst({
      where: eq(pgUser.email, email.toLowerCase()),
    });

    if (existingUser) {
      return NextResponse.json(
        {
          status: "error",
          message: "Este email já está em uso",
        },
        { status: 400 }
      );
    }

    // Criar usuário
    const user = await createUser(
      fullName,
      email,
      password,
      organizationName,
      referrerId
    );

    if (!user) {
      return NextResponse.json(
        {
          status: "error",
          message: "Erro ao criar conta. Tente novamente.",
        },
        { status: 500 }
      );
    }

    // Log para afiliado se houver referrerId
    if (referrerId) {
      const userLogger = new AppLogger({ id: referrerId });
      userLogger.log({
        type: "account",
        title: "Usuário cadastrado com seu link de afiliado",
        description: "Um novo usuário se cadastrou usando seu link de afiliado.",
        severity: "success",
      });
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Conta criada com sucesso! Verifique seu email para ativar a conta.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          status: "error",
          message: "Dados inválidos",
          errors: error.errors,
        },
        { status: 400 }
      );
    }
    return errorHandler(error);
  }
}

