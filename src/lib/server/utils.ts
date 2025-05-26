import { ParsedWordPressInstance } from "@/app/(authenticated)/(dashboard)/sites/page";
import { User } from "../db/schema/index";
import { DomainListItem } from "./apis/namecheap/types";
import namecheapApi from "./apis/namecheap";
import pleskApi from "./apis/plesk";
import { WordPressInstance } from "./apis/plesk/wp-toolkit";
import { cache } from "react";

export async function domainHasWordPress(
  domain: DomainListItem,
  user: User
): Promise<boolean> {
  const wpInstances = await getUserWordPressSites(user.id);

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
  userId: string
) {
  let userDomainNames: string[] = [];
  try {
    console.log("Fetching domains from Namecheap for user:", userId);
    const ncResponse = await namecheapApi.getList({ PageSize: 100 });

    if (ncResponse && ncResponse.Domains) {
      userDomainNames = ncResponse.Domains.map((d: DomainListItem) => d.Name);
    } else {
      console.warn("No domains found for user from Namecheap or API error.");
      userDomainNames = [];
    }
  } catch (error) {
    console.error("Error fetching domains from Namecheap:", error);
    userDomainNames = []; // Default to empty list on error
  }

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
        console.log(instanceHostname, userDomain);
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
