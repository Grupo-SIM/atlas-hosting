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

    // Handle both single instanceId and comma-separated list
    const instanceIds = params.instanceId
      .split(",")
      .map((id) => parseInt(id, 10));

    if (instanceIds.some(isNaN)) {
      return new NextResponse("Invalid instance ID", { status: 400 });
    }

    // Delete all instances in parallel
    await Promise.all(
      instanceIds.map((id) => pleskApi.wordpress.uninstallWp(id))
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting WordPress instances:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
