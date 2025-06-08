import { getUser } from "@/lib/auth";
import pleskApi from "@/lib/server/apis/plesk";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { instanceId, action, pluginData } = await request.json();

    if (!instanceId || !action) {
      return NextResponse.json(
        { error: "Missing instanceId or action" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case "install-plugin":
        if (!pluginData?.id) {
          return NextResponse.json(
            { error: "Missing plugin ID" },
            { status: 400 }
          );
        }
        result = await pleskApi.wordpress.addPluginToWebsite(
          instanceId,
          pluginData.id
        );
        break;

      case "list-plugins":
        result = await pleskApi.wordpress.callWp(
          `--wp-cli -instance-id ${instanceId} -- plugin list --format=json`
        );
        break;

      case "activate-plugin":
        if (!pluginData?.name) {
          return NextResponse.json(
            { error: "Missing plugin name" },
            { status: 400 }
          );
        }
        result = await pleskApi.wordpress.callWp(
          `--wp-cli -instance-id ${instanceId} -- plugin activate ${pluginData.name}`
        );
        break;

      case "deactivate-plugin":
        if (!pluginData?.name) {
          return NextResponse.json(
            { error: "Missing plugin name" },
            { status: 400 }
          );
        }
        result = await pleskApi.wordpress.callWp(
          `--wp-cli -instance-id ${instanceId} -- plugin deactivate ${pluginData.name}`
        );
        break;

      case "update-plugin":
        if (!pluginData?.name) {
          return NextResponse.json(
            { error: "Missing plugin name" },
            { status: 400 }
          );
        }
        result = await pleskApi.wordpress.callWp(
          `--wp-cli -instance-id ${instanceId} -- plugin update ${pluginData.name}`
        );
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error managing WordPress plugins:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
