import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import pleskApi from "@/lib/server/apis/plesk";
import { AppLogger } from "@/lib/server/logs";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  try {
    const user = await getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { instanceId } = await params;

    // Handle both single instanceId and comma-separated list
    const instanceIds = instanceId
      .split(",")
      .map(id => Number.parseInt(id, 10));

    if (instanceIds.some(Number.isNaN)) {
      return new NextResponse("Invalid instance ID", { status: 400 });
    }

    const userLogger = new AppLogger(user);

    // Delete all instances in parallel
    await Promise.all(
      instanceIds.map(async id => {
        const { data } = await pleskApi.domainsApi.domainsIdGet(id);
        try {
          await pleskApi.wordpress.uninstallWp(id);
          userLogger.log({
            description: `A instância do WordPress em "${data.name}" foi excluída com sucesso.`,
            severity: "success",
            title: "Instância do WordPress excluída",
            type: "hosting",
          });
        } catch (error) {
          userLogger.log({
            description: `Falha ao excluir a instância do WordPress em "${data.name}" `,
            severity: "danger",
            title: "Erro ao excluir instância do WordPress",
            type: "hosting",
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
