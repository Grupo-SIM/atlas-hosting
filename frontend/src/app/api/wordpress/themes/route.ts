import { type NextRequest, NextResponse } from "next/server";
import {
  activateTheme,
  deleteTheme,
  installTheme,
  updateTheme,
} from "@/app/(auth)/sites/wordpress-specific/actions";
import { getUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, instanceId, themeName, themeSlug } = await req.json();

    if (!action || !instanceId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case "activate":
        if (!themeName) {
          return NextResponse.json(
            { error: "Theme name is required for activation" },
            { status: 400 }
          );
        }
        result = await activateTheme(instanceId, themeName);
        break;

      case "update":
        if (!themeName) {
          return NextResponse.json(
            { error: "Theme name is required for update" },
            { status: 400 }
          );
        }
        result = await updateTheme(instanceId, themeName);
        break;

      case "delete":
        if (!themeName) {
          return NextResponse.json(
            { error: "Theme name is required for deletion" },
            { status: 400 }
          );
        }
        result = await deleteTheme(instanceId, themeName);
        break;

      case "install":
        if (!themeSlug) {
          return NextResponse.json(
            { error: "Theme slug is required for installation" },
            { status: 400 }
          );
        }
        result = await installTheme(instanceId, themeSlug);
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (result.success) {
      return NextResponse.json({
        message: result.message,
        success: true,
      });
    }
    return NextResponse.json(
      {
        error: result.message,
        success: false,
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("Theme API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
