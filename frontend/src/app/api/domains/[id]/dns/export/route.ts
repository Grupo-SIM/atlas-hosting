import { and, eq } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgOrganizationDomains } from "@/lib/db/schema";
import { cloudflareApi } from "@/lib/server/apis/cloudflare";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getUser();
  const domain = await db.query.pgOrganizationDomains.findFirst({
    where: and(
      eq(pgOrganizationDomains.id, id),
      eq(pgOrganizationDomains.organizationId, user.organization.id)
    ),
  });
  if (!domain?.cloudflareZoneId)
    return Response.json({ message: "Zona não encontrada." }, { status: 404 });
  const zoneFile = await cloudflareApi.exportZoneFile(domain.cloudflareZoneId);
  return new Response(zoneFile, {
    headers: {
      "Content-Disposition": `attachment; filename="${domain.domain}.txt"`,
      "Content-Type": "text/dns; charset=utf-8",
    },
  });
}
