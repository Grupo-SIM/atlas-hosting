"use server";

import { getUser } from "@/lib/auth/index";
import { db } from "@/lib/db";
import { pgUser } from "@/lib/db/schema/tables/user";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function saveUserBillingInfo(data: {
  document: string;
  phoneNumber: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
}) {
  const user = await getUser();

  if (!user) {
    return { status: "error", message: "Usuário não autenticado." };
  }

  try {
    await db
      .update(pgUser)
      .set({
        billingDocument: data.document.replace(/\D/g, ""),
        billingPhone: data.phoneNumber.replace(/\D/g, ""),
        billingStreet: data.address.street,
        billingNumber: data.address.number,
        billingNeighborhood: data.address.neighborhood,
        billingCity: data.address.city,
        billingState: data.address.state,
        billingZipCode: data.address.zipCode.replace(/\D/g, ""),
        updatedAt: new Date(),
      })
      .where(eq(pgUser.id, user.id));

    revalidatePath("/billing");
    return { status: "success", message: "Informações de cobrança salvas no perfil." };
  } catch (error) {
    console.error("Error saving billing info:", error);
    return { status: "error", message: "Erro ao salvar informações de cobrança." };
  }
}

export async function getUserBillingInfo() {
  const user = await getUser();

  if (!user) return null;

  try {
    const dbUser = await db.query.pgUser.findFirst({
      where: eq(pgUser.id, user.id),
      columns: {
        billingDocument: true,
        billingPhone: true,
        billingStreet: true,
        billingNumber: true,
        billingNeighborhood: true,
        billingCity: true,
        billingState: true,
        billingZipCode: true,
        name: true,
      },
    });

    if (!dbUser || !dbUser.billingDocument) return null;

    // Split name into first and last name as a helper
    const nameParts = dbUser.name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    return {
      firstName,
      lastName,
      document: dbUser.billingDocument,
      phoneNumber: dbUser.billingPhone,
      address: {
        street: dbUser.billingStreet,
        number: dbUser.billingNumber,
        neighborhood: dbUser.billingNeighborhood,
        city: dbUser.billingCity,
        state: dbUser.billingState,
        zipCode: dbUser.billingZipCode,
      },
    };
  } catch (error) {
    console.error("Error fetching billing info:", error);
    return null;
  }
}
