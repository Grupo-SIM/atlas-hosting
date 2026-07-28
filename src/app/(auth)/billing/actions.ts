"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth/index";
import { db } from "@/lib/db";
import { pgUser } from "@/lib/db/schema/tables/user";

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
    return { message: "Usuário não autenticado.", status: "error" };
  }

  try {
    await db
      .update(pgUser)
      .set({
        billingCity: data.address.city,
        billingDocument: data.document.replace(/\D/g, ""),
        billingNeighborhood: data.address.neighborhood,
        billingNumber: data.address.number,
        billingPhone: data.phoneNumber.replace(/\D/g, ""),
        billingState: data.address.state,
        billingStreet: data.address.street,
        billingZipCode: data.address.zipCode.replace(/\D/g, ""),
        updatedAt: new Date(),
      })
      .where(eq(pgUser.id, user.id));

    revalidatePath("/billing");
    return {
      message: "Informações de cobrança salvas no perfil.",
      status: "success",
    };
  } catch (error) {
    console.error("Error saving billing info:", error);
    return {
      message: "Erro ao salvar informações de cobrança.",
      status: "error",
    };
  }
}

export async function getUserBillingInfo() {
  const user = await getUser();

  if (!user) return null;

  try {
    const dbUser = await db.query.pgUser.findFirst({
      columns: {
        billingCity: true,
        billingDocument: true,
        billingNeighborhood: true,
        billingNumber: true,
        billingPhone: true,
        billingState: true,
        billingStreet: true,
        billingZipCode: true,
        name: true,
      },
      where: eq(pgUser.id, user.id),
    });

    if (!dbUser?.billingDocument) return null;

    // Split name into first and last name as a helper
    const nameParts = dbUser.name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    return {
      address: {
        city: dbUser.billingCity,
        neighborhood: dbUser.billingNeighborhood,
        number: dbUser.billingNumber,
        state: dbUser.billingState,
        street: dbUser.billingStreet,
        zipCode: dbUser.billingZipCode,
      },
      document: dbUser.billingDocument,
      firstName,
      lastName,
      phoneNumber: dbUser.billingPhone,
    };
  } catch (error) {
    console.error("Error fetching billing info:", error);
    return null;
  }
}
