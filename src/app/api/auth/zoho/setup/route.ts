import { NextRequest, NextResponse } from "next/server";
import { zohoOAuthManager } from "@/lib/server/apis/zoho/oauth";

export async function GET(request: NextRequest) {
  try {
    // Check if we already have valid tokens
    const hasTokens = await zohoOAuthManager.hasValidTokens();

    if (hasTokens) {
      return NextResponse.json({
        message: "OAuth already configured",
        status: "configured",
      });
    }

    // Generate authorization URL
    const authUrl = zohoOAuthManager.getAuthorizationUrl("setup");

    return NextResponse.json({
      message: "Please complete OAuth authorization",
      authUrl,
      status: "needs_auth",
    });
  } catch (error) {
    console.error("Error in OAuth setup:", error);
    return NextResponse.json(
      { error: "Failed to initialize OAuth setup" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === "revoke") {
      await zohoOAuthManager.revokeTokens();
      return NextResponse.json({
        message: "OAuth tokens revoked successfully",
        status: "revoked",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in OAuth setup POST:", error);
    return NextResponse.json(
      { error: "Failed to process OAuth request" },
      { status: 500 }
    );
  }
}
