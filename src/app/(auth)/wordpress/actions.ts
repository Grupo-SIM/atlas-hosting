"use server";

import { getUser } from "@/lib/auth";
import { getUserWordPressSites } from "@/lib/server/utils";
import pleskApi from "@/lib/server/apis/plesk";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface WordPressPluginInfo {
  id: number;
  name: string;
  version: string;
  status: "active" | "inactive";
  updateAvailable?: boolean;
  description?: string;
}

export interface WordPressSiteInfo {
  id: number;
  instanceId: number;
  name: string;
  domain: string;
  path: string;
  status: string;
  version: string;
  loginUrl: string;
  url?: string; // Computed from domain + path
  createdAt?: string;
  plugins?: WordPressPluginInfo[];
  users?: Array<{
    id: number;
    username: string;
    email: string;
    role: string;
  }>;
  hasUpdates?: boolean;
  lastBackup?: string;
  updatesAvailable?: {
    core?: boolean;
    plugins?: WordPressPluginInfo[];
  };
}

export async function getWordPressSitesForSelectedDomain(): Promise<
  WordPressSiteInfo[]
> {
  const user = await getUser();

  try {
    const wpInstances = await getUserWordPressSites(user);

    // Filter by selected domain if set
    let filteredInstances = wpInstances;
    if (user.selectedDomain) {
      filteredInstances = wpInstances.filter((instance) => {
        try {
          const instanceHostname = new URL(instance.domain).hostname;
          return (
            instanceHostname === user.selectedDomain ||
            instanceHostname === `www.${user.selectedDomain}`
          );
        } catch (e) {
          return false;
        }
      });
    }

    // Enhance with additional info
    const enhancedSites = await Promise.all(
      filteredInstances.map(async (instance): Promise<WordPressSiteInfo> => {
        try {
          // Get plugins for this instance (table format)
          const pluginsResponse = await pleskApi.wordpress.callWp(
            `--wp-cli -instance-id ${instance.instanceId} -- plugin list`
          );

          let plugins: WordPressPluginInfo[] = [];
          if (pluginsResponse.stdout) {
            plugins = parsePluginList(pluginsResponse.stdout);
          }

          // Get users for this instance (table format)
          const usersResponse = await pleskApi.wordpress.callWp(
            `--wp-cli -instance-id ${instance.instanceId} -- user list`
          );

          let users: Array<{
            id: number;
            username: string;
            email: string;
            role: string;
          }> = [];
          if (usersResponse.stdout) {
            users = parseUserList(usersResponse.stdout);
          }

          // Check for core updates (table format)
          const coreUpdateResponse = await pleskApi.wordpress.callWp(
            `--wp-cli -instance-id ${instance.instanceId} -- core check-update`
          );

          let hasUpdates = false;
          if (coreUpdateResponse.stdout) {
            // If there's output, there are updates available
            // If core is up to date, the command usually returns empty or "Success: WordPress is up to date."
            const output = coreUpdateResponse.stdout.trim();
            hasUpdates =
              output.length > 0 &&
              !output.includes("up to date") &&
              !output.includes("Success:");
          }

          const pluginsWithUpdates = plugins.filter((p) => p.updateAvailable);

          return {
            id: instance.id,
            instanceId: instance.instanceId,
            name: instance.name,
            domain: instance.domain,
            path: instance.path,
            status: instance.status,
            version: "6.4.2", // We could get this from WP CLI if needed
            loginUrl: `${instance.domain}/wp-admin`,
            url: instance.domain, // Use domain as URL
            createdAt: new Date().toISOString(), // Placeholder - could get from instance data
            plugins,
            users,
            hasUpdates: hasUpdates || plugins.some((p) => p.updateAvailable),
            updatesAvailable: {
              core: hasUpdates,
              plugins: pluginsWithUpdates,
            },
          };
        } catch (error) {
          console.error(
            `Error getting details for WordPress instance ${instance.id}:`,
            error
          );
          return {
            id: instance.id,
            instanceId: instance.instanceId,
            name: instance.name,
            domain: instance.domain,
            path: instance.path,
            status: instance.status,
            version: "Unknown",
            loginUrl: `${instance.domain}/wp-admin`,
            url: instance.domain, // Use domain as URL
            createdAt: new Date().toISOString(), // Placeholder
            plugins: [],
            users: [],
            hasUpdates: false,
            updatesAvailable: {
              core: false,
              plugins: [],
            },
          };
        }
      })
    );

    return enhancedSites;
  } catch (error) {
    console.error("Error fetching WordPress sites:", error);
    return [];
  }
}

export async function updateWordPressCore(instanceId: number) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  try {
    const response = await pleskApi.wordpress.callWp(
      `--wp-cli -instance-id ${instanceId} -- core update`
    );

    revalidatePath("/wordpress");
    return { success: true, message: "WordPress core updated successfully" };
  } catch (error) {
    console.error("Error updating WordPress core:", error);
    return { success: false, message: "Failed to update WordPress core" };
  }
}

export async function updatePlugin(instanceId: number, pluginName: string) {
  const user = await getUser();

  try {
    const response = await pleskApi.wordpress.callWp(
      `--wp-cli -instance-id ${instanceId} -- plugin update ${pluginName}`
    );

    revalidatePath("/wordpress");
    return {
      success: true,
      message: `Plugin ${pluginName} updated successfully`,
    };
  } catch (error) {
    console.error(`Error updating plugin ${pluginName}:`, error);
    return { success: false, message: `Failed to update plugin ${pluginName}` };
  }
}

export async function togglePlugin(
  instanceId: number,
  pluginName: string,
  activate: boolean
) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  try {
    const action = activate ? "activate" : "deactivate";
    const response = await pleskApi.wordpress.callWp(
      `--wp-cli -instance-id ${instanceId} -- plugin ${action} ${pluginName}`
    );

    revalidatePath("/wordpress");
    return {
      success: true,
      message: `Plugin ${pluginName} ${activate ? "activated" : "deactivated"} successfully`,
    };
  } catch (error) {
    console.error(
      `Error ${activate ? "activating" : "deactivating"} plugin ${pluginName}:`,
      error
    );
    return {
      success: false,
      message: `Failed to ${activate ? "activate" : "deactivate"} plugin ${pluginName}`,
    };
  }
}

export async function createWordPressBackup(instanceId: number) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  try {
    // This would depend on your backup solution - using WP CLI export as example
    const response = await pleskApi.wordpress.callWp(
      `--wp-cli -instance-id ${instanceId} -- db export --add-drop-table`
    );

    revalidatePath("/wordpress");
    return { success: true, message: "Backup created successfully" };
  } catch (error) {
    console.error("Error creating backup:", error);
    return { success: false, message: "Failed to create backup" };
  }
}

export async function createWordPressUser(
  instanceId: number,
  username: string,
  email: string,
  password: string,
  role: string = "subscriber"
) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  try {
    const response = await pleskApi.wordpress.callWp(
      `--wp-cli -instance-id ${instanceId} -- user create ${username} ${email} --role=${role} --user_pass=${password}`
    );

    revalidatePath("/wordpress");
    return { success: true, message: `User ${username} created successfully` };
  } catch (error) {
    console.error("Error creating WordPress user:", error);
    return { success: false, message: "Failed to create user" };
  }
}

// Helper functions for parsing wp-cli table output
function parseTableOutput(output: string): Array<Record<string, string>> {
  if (!output?.trim()) return [];

  const lines = output.trim().split("\n");
  if (lines.length < 2) return [];

  // First line contains headers
  const headerLine = lines[0];
  const headers = headerLine
    .split("\t")
    .map((h) => h.trim())
    .filter(Boolean);

  const results: Array<Record<string, string>> = [];

  // Parse each data line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    console.log({ line });

    // Split by multiple spaces to separate columns
    const values = line.split("\t").map((v) => v.trim());

    console.log({values})

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    results.push(row);
  }

  return results;
}

function parsePluginList(output: string): WordPressPluginInfo[] {
  const rows = parseTableOutput(output);

  console.log({ rows });

  return rows.map((row, index) => ({
    id: index + 1,
    name: row.name || row.Name || "",
    version: row.version || row.Version || "",
    status: (row.status || row.Status || "inactive").toLowerCase() as
      | "active"
      | "inactive",
    updateAvailable:
      (row.update || row.Update || "").toLowerCase() === "available",
    description:
      row.title || row.Title || row.description || row.Description || "",
  }));
}

function parseThemeList(
  output: string
): Array<{ name: string; status: string; version: string; update: string }> {
  const rows = parseTableOutput(output);

  return rows.map((row) => ({
    name: row.name || row.Name || "",
    status: row.status || row.Status || "",
    version: row.version || row.Version || "",
    update: row.update || row.Update || "",
  }));
}

function parseUserList(
  output: string
): Array<{ id: number; username: string; email: string; role: string }> {
  const rows = parseTableOutput(output);

  return rows.map((row) => ({
    id: Number.parseInt(row.ID || row.id || "0", 10),
    username: row.user_login || row.username || row.Username || "",
    email: row.user_email || row.email || row.Email || "",
    role: row.roles || row.role || row.Role || "subscriber",
  }));
}
