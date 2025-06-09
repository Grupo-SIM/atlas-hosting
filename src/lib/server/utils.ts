"use server";

import type { ParsedWordPressInstance } from "@/app/(auth)/sites/page";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "../db";
import { pgUser, type User } from "../db/schema/index";
import namecheapApi from "./apis/namecheap";
import type { DomainListItem } from "./apis/namecheap/types";
import pleskApi from "./apis/plesk";
import type { WordPressInstance } from "./apis/plesk/wp-toolkit";
import type { DomainsGetInfoCleanedResponse } from "@/lib/server/apis/namecheap/types";

export async function domainHasWordPress(
  domain: DomainListItem,
  user: User
): Promise<boolean> {
  const wpInstances = await getUserWordPressSites(user);

  let domainNameToCheck = domain.Name;
  try {
    if (!domainNameToCheck.startsWith("http")) {
      domainNameToCheck = `https://${domainNameToCheck}`;
    }
    const domainHostname = new URL(domainNameToCheck).hostname;
    return wpInstances.some((wp) => {
      try {
        return new URL(wp.domain).hostname === domainHostname;
      } catch (e) {
        return false;
      }
    });
  } catch (e) {
    return false;
  }
}

export const getUserWordPressSites = cache(async function getUserWordPressSites(
  user: User
) {
  const userDomainNames = user.organization.domains.map(
    (domain) => domain.domain
  );

  // Fetch WordPress instances from Plesk
  let allWpInstances: ParsedWordPressInstance[] = [];
  try {
    const wpResponse = await pleskApi.wordpress.list(); // Lists all WP instances on the server

    if (wpResponse.stdout) {
      allWpInstances = JSON.parse(wpResponse.stdout).map(
        (instance: WordPressInstance) => ({
          id: instance.id, // WP Toolkit specific ID
          instanceId: instance.id, // Redundant, but kept for consistency if used elsewhere
          name: instance.name, // Title of the site
          domain: instance.siteUrl || instance.mainDomainId, // site_url is usually the one from WP Toolkit JSON output
          path: instance.path,
          status: instance.stateText,
        })
      );
    }
  } catch (error) {
    console.error("Error fetching WordPress instances from Plesk:", error);
  }

  // Filter WordPress instances to only show those associated with the user's Namecheap domains
  const userWpInstances = allWpInstances.filter((instance) => {
    if (!instance.domain) return false;
    try {
      const instanceHostname = new URL(instance.domain).hostname;
      return userDomainNames.some((userDomain) => {
        return (
          instanceHostname === userDomain ||
          instanceHostname === `www.${userDomain}`
        );
      });
    } catch (e) {
      console.warn(`Invalid URL for WP instance domain: ${instance.domain}`);
      return false;
    }
  });

  return userWpInstances;
});

// Function to get domains and check if WordPress is installed (already in your existing page.tsx, adapted slightly)
export const getUserDomains = cache(async function getUserDomains(
  user: User
): Promise<(DomainsGetInfoCleanedResponse & { inPlesk: boolean })[]> {
  try {
    const allDomains = await Promise.all(
      user.organization.domains.map(async (domain) => {
        return namecheapApi.getInfo({
          DomainName: domain.domain,
        });
      })
    );

    const wpInstances = await getUserWordPressSites(user); // Reuse the existing function

    const domainsWithPleskData = await Promise.all(
      allDomains.map(async (domain) => {
        let domainNameToCheck = domain.DomainName;
        try {
          // Ensure domain.Name is a valid URL string before parsing
          if (!domainNameToCheck.startsWith("http")) {
            domainNameToCheck = `https://${domainNameToCheck}`;
          }
          const domainHostname = new URL(domainNameToCheck).hostname;
          return {
            ...domain,
            inPlesk: wpInstances.some((wp) => {
              try {
                return new URL(wp.domain).hostname === domainHostname;
              } catch (e) {
                // console.warn(`Invalid URL for WP instance domain during comparison: ${wp.domain}`);
                return false;
              }
            }),
          };
        } catch (e) {
          console.log(e);
          return { ...domain, inPlesk: false };
        }
      })
    );

    return domainsWithPleskData;
  } catch (error) {
    console.error("Exception fetching/processing Namecheap domains:", error);
    return [];
  }
});

export const getUserCurrentDomain = cache(async function getUserCurrentDomain(
  user: User
): Promise<DomainsGetInfoCleanedResponse | null> {
  const domains = await getUserDomains(user);
  const domain = await _getUserCurrentDomain(user, domains);

  if (!domain && domains.length > 0) {
    await db
      .update(pgUser)
      .set({
        selectedDomain: domains[0].DomainName,
      })
      .where(eq(pgUser.id, user.id))
      .execute();
    return domains[0]; // Default to the first domain
  }

  return domain;
});

async function _getUserCurrentDomain(
  user: User,
  domains: (DomainsGetInfoCleanedResponse & {
    inPlesk: boolean;
  })[]
): Promise<DomainsGetInfoCleanedResponse | null> {
  if (!user.selectedDomain) {
    return null;
  }

  const fullDomain = domains.find(
    (domain) => domain.DomainName === user.selectedDomain
  );

  if (!fullDomain) {
    throw new Error(
      `Selected domain "${user.selectedDomain}" not found in user's domains.`
    );
  }

  return fullDomain;
}
