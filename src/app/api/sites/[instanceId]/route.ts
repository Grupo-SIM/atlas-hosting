import { NextResponse } from "next/server";
import pleskApi from "@/lib/server/apis/plesk";
import { getUser } from "@/lib/auth";
import { AppLogger } from "@/lib/server/logs";
import { cookies } from "next/headers";

export async function DELETE(
  request: Request,
  { params }: { params: { instanceId: string } }
) {
  try {
    const cookieStore = await cookies();
    const user = await getUser(cookieStore);

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Handle both single instanceId and comma-separated list
    const instanceIds = params.instanceId
      .split(",")
      .map((id) => Number.parseInt(id, 10));

    if (instanceIds.some(Number.isNaN)) {
      return new NextResponse("Invalid instance ID", { status: 400 });
    }

    const userLogger = new AppLogger(user);

    // Delete all instances in parallel
    await Promise.all(
      instanceIds.map(async (id) => {
        const { data } = await pleskApi.domainsApi.domainsIdGet(id);
        try {
          await pleskApi.wordpress.uninstallWp(id);
          userLogger.log({
            type: "hosting",
            severity: "success",
            title: "Instância do WordPress excluída",
            description: `A instância do WordPress em "${data.name}" foi excluída com sucesso.`,
          });
        } catch (error) {
          userLogger.log({
            type: "hosting",
            severity: "danger",
            title: "Erro ao excluir instância do WordPress",
            description: `Falha ao excluir a instância do WordPress em "${data.name}" `,
          });
          throw new Error(
            `Falha ao excluir a instância do WordPress em "${data.name}".`
          );
        }
      })
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting WordPress instances:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
