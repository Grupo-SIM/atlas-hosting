import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgOrganization, pgUser, pgWallet } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function GET() {
  const user = await getUser();

  if (!user.organizationId) {
    const walletResult = await db
      .insert(pgWallet)
      .values({
        balance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const { id: walletId } = walletResult[0];

    const newOrg = await db
      .insert(pgOrganization)
      .values({
        name: user.name,
        walletId,
        ownerId: user.id,
      })
      .returning();

    console.log(user.id);

    await db
      .update(pgUser)
      .set({
        organizationId: newOrg[0].id,
      })
      .where(eq(pgUser.id, user.id));
  }

  redirect("/");
}
