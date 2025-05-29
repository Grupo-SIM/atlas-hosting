import { NextRequest, NextResponse } from "next/server";
import { zohoOAuthManager } from "@/lib/server/apis/zoho/oauth";

export async function GET(request: NextRequest) {
  try {
    // Check if OAuth is already configured
    const hasValidTokens = await zohoOAuthManager.hasValidTokens();

    if (hasValidTokens) {
      // Already configured, redirect to email page
      return NextResponse.redirect(new URL("/dashboard/email", request.url));
    }

    // Generate a random state parameter for security
    const state =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    // Get the authorization URL
    const authUrl = zohoOAuthManager.getAuthorizationUrl(state);

    // Store the state in a cookie or session for verification
    // For now, we'll redirect directly
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Error in OAuth setup:", error);

    // Check if it's a configuration error
    if (error instanceof Error && error.message.includes("ZOHO_CLIENT_ID")) {
      return NextResponse.json(
        {
          error: "OAuth configuration missing",
          message:
            "Please set ZOHO_CLIENT_ID and ZOHO_CLIENT_SECRET environment variables",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Setup failed",
        message: "Failed to initialize OAuth setup",
      },
      { status: 500 }
    );
  }
}
