import { getUser } from "@/lib/auth";
import {
  getUserCurrentDomain,
  getUserWordPressSites,
} from "@/lib/server/utils";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [wordPressSites, currentDomain] = await Promise.all([
      getUserWordPressSites(user),
      getUserCurrentDomain(user),
    ]);

    // Filter WordPress sites for the current selected domain only
    const filteredSites = currentDomain
      ? wordPressSites.filter((site) => {
          if (!site.domain) return false;
          try {
            const siteHostname = new URL(site.domain).hostname;
            return (
              siteHostname === currentDomain.DomainName ||
              siteHostname === `www.${currentDomain.DomainName}`
            );
          } catch (e) {
            return false;
          }
        })
      : [];

    return NextResponse.json({
      sites: filteredSites,
      currentDomain: currentDomain?.DomainName || null,
      totalSites: filteredSites.length,
    });
  } catch (error) {
    console.error("Error fetching WordPress sites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
