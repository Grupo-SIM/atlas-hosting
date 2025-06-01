import { type NextRequest, NextResponse } from "next/server";
import { zohoOAuthManager } from "@/lib/server/apis/zoho/oauth";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle OAuth error
    if (error) {
      console.error("OAuth error:", error);
      return NextResponse.redirect(
        new URL(`/auth/zoho/error?error=${error}`, request.url)
      );
    }

    // Handle missing authorization code
    if (!code) {
      return NextResponse.redirect(
        new URL("/auth/zoho/error?error=missing_code", request.url)
      );
    }

    // Exchange code for tokens
    await zohoOAuthManager.exchangeCodeForTokens(code);

    // Redirect to success page or dashboard
    return NextResponse.redirect(new URL("/email?oauth=success", request.url));
  } catch (error) {
    console.error("Error in OAuth callback:", error);
    return NextResponse.redirect(
      new URL("/auth/zoho/error?error=exchange_failed", request.url)
    );
  }
}
