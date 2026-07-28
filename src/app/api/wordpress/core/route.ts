import { type NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import pleskApi from "@/lib/server/apis/plesk";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { instanceId, action } = await request.json();

    if (!instanceId || !action) {
      return NextResponse.json(
        { error: "Missing instanceId or action" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case "check-core-updates":
        result = await pleskApi.wordpress.callWp(
          `--wp-cli -instance-id ${instanceId} -- core check-update --format=json`
        );
        break;

      case "update-core":
        result = await pleskApi.wordpress.callWp(
          `--wp-cli -instance-id ${instanceId} -- core update`
        );
        break;

      case "get-version":
        result = await pleskApi.wordpress.callWp(
          `--wp-cli -instance-id ${instanceId} -- core version`
        );
        break;

      case "maintenance-mode-on":
        result = await pleskApi.wordpress.callWp(
          `--wp-cli -instance-id ${instanceId} -- maintenance-mode activate`
        );
        break;

      case "maintenance-mode-off":
        result = await pleskApi.wordpress.callWp(
          `--wp-cli -instance-id ${instanceId} -- maintenance-mode deactivate`
        );
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ result, success: true });
  } catch (error) {
    console.error("Error managing WordPress core:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
