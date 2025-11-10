import { auth, signOut } from "@/auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { pgSession } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { validateSession } from "@/lib/auth/utils";

export async function POST() {
  try {

    const session = await auth();
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;

    const isNextAuthAuthenticated = !!session?.user;

    let isCustomSessionAuthenticated = false;
    if (sessionToken) {
      const { user } = await validateSession(sessionToken);
      isCustomSessionAuthenticated = !!user;
    }

    if (!isNextAuthAuthenticated && !isCustomSessionAuthenticated) {
      return NextResponse.json(
        {
          status: "error",
          message: "Usuário não autenticado",
        },
        { status: 401 }
      );
    }

    if (isNextAuthAuthenticated) {
      try {
        await signOut({
          redirect: false,
        });
      } catch (error) {
        console.warn("Erro ao fazer signOut do NextAuth:", error);
      }
    }

    if (sessionToken) {
      try {
        await db.delete(pgSession).where(eq(pgSession.id, sessionToken));
      } catch (error) {
        console.warn("Sessão customizada não encontrada:", error);
      }
    }

    cookieStore.delete("session_token");

    cookieStore.delete("authjs.session-token");
    cookieStore.delete("authjs.csrf-token");
    cookieStore.delete("authjs.callback-url");

    return NextResponse.json(
      {
        status: "success",
        message: "Logout realizado com sucesso",
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": [
            "authjs.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax",
            "authjs.csrf-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax",
            "session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax",
          ].join(", "),
        },
      }
    );
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Erro ao fazer logout. Tente novamente.",
      },
      { status: 500 }
    );
  }
}

