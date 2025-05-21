import { NextResponse } from "next/server";
import pleskApi from "@/lib/server/apis/plesk";
import { getUser } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: { instanceId: string } }
) {
  try {
    const user = await getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const instanceId = parseInt(params.instanceId, 10);
    if (isNaN(instanceId)) {
      return new NextResponse("Invalid instance ID", { status: 400 });
    }

    await pleskApi.wordpress.uninstallWp(instanceId);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting WordPress instance:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 