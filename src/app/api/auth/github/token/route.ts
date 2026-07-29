import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { pgUser } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    const url = req.nextUrl.clone();
    url.pathname = "/sites/new";
    url.searchParams.set("error", "github_auth_failed");
    url.searchParams.set(
      "error_description",
      "O código de autorização do GitHub não foi encontrado."
    );
    return NextResponse.redirect(url);
  }

  try {
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        body: JSON.stringify({
          client_id: process.env.AUTH_GITHUB_ID,
          client_secret: process.env.AUTH_GITHUB_SECRET,
          code,
        }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "POST",
      }
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error || !tokenData.access_token) {
      throw new Error(
        tokenData.error_description ||
          "Falha ao trocar o código pelo token de acesso."
      );
    }

    const accessToken = tokenData.access_token;

    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Usuário não autenticado.");
    }

    await db
      .update(pgUser)
      .set({ githubToken: accessToken })
      .where(eq(pgUser.id, session.user.id));

    const url = req.nextUrl.clone();
    url.pathname = "/sites/new";
    url.searchParams.set("github_linked", "true");
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Erro no callback do GitHub:", error);
    const url = req.nextUrl.clone();
    url.pathname = "/sites/new";
    url.searchParams.set("error", "github_token_exchange_failed");
    if (error instanceof Error) {
      url.searchParams.set("error_description", error.message);
    }
    return NextResponse.redirect(url);
  }
}
