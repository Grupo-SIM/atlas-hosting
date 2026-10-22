import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getUserCurrentDomain } from "@/lib/server/utils";

export const metadata: Metadata = {
  description: "Gerencie os registros DNS do seu domínio pelo Atlas Hosting.",
  title: "Gerenciamento de DNS - Atlas Hosting",
};

export default async function LegacyDnsPage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string }>;
}) {
  const { domain: requested } = await searchParams;
  const user = await getUser();
  const domain = requested
    ? user.organization.domains.find(
        item => item.id === requested || item.domain === requested
      )
    : await getUserCurrentDomain(user);
  redirect(domain ? `/domains/${domain.id}` : "/domains");
}
