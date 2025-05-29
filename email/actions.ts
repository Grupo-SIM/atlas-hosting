"use server";

import { getUser } from "@/lib/auth";
import { hashWithEncodeKey } from "@/lib/auth/scrypt";
import { db } from "@/lib/db";
import { pgZohoDomainOrganizations } from "@/lib/db/schema/tables/email";
import { zohoMailApi } from "@/lib/server/apis/zoho"; // For validation
import { generateRandomPassword } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import * as yup from "yup";

const LinkZohoSchema = yup.object({
  domainName: yup
    .string()
    .min(1, "Domain name is required.")
    .matches(/^(?!-)[A-Za-z0-9-]{1,63}(?<!-)$/, "Domínio inválido"),
});

export async function linkZohoOrganization(selectedDomain: string) {
  const user = await getUser();

  if (!user || !user.id) {
    return { error: "Authentication required.", status: 401 };
  }

  let validatedFields: yup.InferType<typeof LinkZohoSchema>;

  try {
    validatedFields = await LinkZohoSchema.validate({
      domainName: selectedDomain,
    });
  } catch (error) {
    let cause = "Domínio inválido";

    if (error instanceof yup.ValidationError) {
      cause = error.message;
    }

    return {
      error: "Invalid input.",
      errors: cause,
      status: 400,
    };
  }

  const { domainName } = validatedFields as Required<typeof validatedFields>;

  const existingOrg = await db.query.pgZohoDomainOrganizations.findFirst({
    where: and(
      eq(pgZohoDomainOrganizations.userId, user.id),
      eq(pgZohoDomainOrganizations.domainName, domainName)
    ),
  });

  if (existingOrg) {
    return {
      error: `Domínio ${domainName} já está vinculado a uma organização Zoho.`,
      status: 400,
    };
  }

  try {
    const password = await hashWithEncodeKey(generateRandomPassword());

    const childOrg = await zohoMailApi.createChildOrganization({
      domainName,
      password,
      emailId: `admin@${domainName}`,
      orgName: `${user.name.replace(/\s+/g, "").toLowerCase()}-atlas-org`,
      firstName: user.name.split(" ")[0] || "Admin",
      lastName: user.name.split(" ").slice(1).join(" ") || "User",
    });

    await db.insert(pgZohoDomainOrganizations).values({
      domainName,
      password,
      userId: user.id,
      zohoOrgId: childOrg.zoid,
    });
  } catch (e: any) {
    return {
      error: `Não foi possível criar sua organização com o Zoho`,
      status: 400,
    };
  }
}
