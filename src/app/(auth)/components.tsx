import DomainSelector from "@/components/domains/DomainSelector";
import { getUser } from "@/lib/auth";
import { getUserCurrentDomain } from "@/lib/server/utils";
import { find } from "lodash";
import { redirect } from "next/navigation";

export async function UserSiteSelect() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const selectedDomain = await getUserCurrentDomain(user);

  const selectedDomainInfo = find(
    user.organization.domains,
    (domain) => domain.domain === selectedDomain?.domain
  );

  return (
    selectedDomain && (
      <DomainSelector
        domains={user.organization.domains}
        selectedDomain={selectedDomainInfo}
      />
    )
  );
}
