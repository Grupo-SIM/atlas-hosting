"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import pleskApi from "@/lib/server/apis/plesk";
import WpCliApi from "@/lib/server/apis/plesk/wp-toolkit/wp-cli";
import { getUserWordPressSites } from "@/lib/server/utils";
import type {
  WordPressSiteInfo,
  WordPressThemeInfo,
  WordPressUserInfo,
} from "./types";

export async function getWordPressSitesForSelectedDomain(): Promise<
  WordPressSiteInfo[]
> {
  const user = await getUser();

  try {
    const wpInstances = await getUserWordPressSites(user);

    // Filter by selected domain if set
    let filteredInstances = wpInstances;
    if (user.selectedDomain) {
      filteredInstances = wpInstances.filter(instance => {
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
          const wpCli = new WpCliApi(instance.id);
          const plugins = await wpCli.plugin.list({
            fields: pluginFields.join(","),
            format: "json",
          });

          // Get themes for this instance
          const themesResponse = await pleskApi.wordpress.callWp(
            `--wp-cli -instance-id ${instance.instanceId} -- theme list --format=json --fields=${themeFields.join(",")}`
          );

          let themes: WordPressThemeInfo[] = [];
          if (themesResponse.stdout) {
            const rawThemes = JSON.parse(
              themesResponse.stdout
            ) as WordPressThemeInfo[];
            themes = rawThemes.map(theme => ({
              ...theme,
              updateAvailable: theme.update === "available",
            }));
          }

          // Get users for this instance (table format)
          const usersResponse = await pleskApi.wordpress.callWp(
            `--wp-cli -instance-id ${instance.instanceId} -- user list --format=json`
          );

          let users: WordPressUserInfo[] = [];
          if (usersResponse.stdout) {
            users = JSON.parse(usersResponse.stdout);
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

          const pluginsWithUpdates = plugins.filter(
            p => p.version < (p.updateVersion ?? 0)
          );
          const themesWithUpdates = themes.filter(
            t => t.update === "available"
          );

          return {
            createdAt: new Date().toISOString(), // Placeholder - could get from instance data
            domain: instance.domain,
            hasUpdates:
              hasUpdates ||
              plugins.some(p => p.version < (p.updateVersion ?? 0)) ||
              themes.some(t => t.update === "available"),
            id: instance.id,
            instanceId: instance.instanceId,
            loginUrl: `${instance.domain}/wp-admin`,
            name: instance.name,
            path: instance.path,
            plugins,
            status: instance.status,
            themes,
            updatesAvailable: {
              core: hasUpdates,
              plugins: pluginsWithUpdates,
              themes: themesWithUpdates,
            },
            url: instance.domain, // Use domain as URL
            users,
            version: "6.4.2", // We could get this from WP CLI if needed
          };
        } catch (error) {
          console.error(
            `Error getting details for WordPress instance ${instance.id}:`,
            error
          );
          return {
            createdAt: new Date().toISOString(), // Placeholder
            domain: instance.domain,
            hasUpdates: false,
            id: instance.id,
            instanceId: instance.instanceId,
            loginUrl: `${instance.domain}/wp-admin`,
            name: instance.name,
            path: instance.path,
            plugins: [],
            status: instance.status,
            updatesAvailable: {
              core: false,
              plugins: [],
            },
            url: instance.domain, // Use domain as URL
            users: [],
            version: "Unknown",
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
    return { message: "WordPress core updated successfully", success: true };
  } catch (error) {
    console.error("Error updating WordPress core:", error);
    return { message: "Failed to update WordPress core", success: false };
  }
}

export async function updatePlugin(instanceId: number, pluginName: string) {
  try {
    const response = await pleskApi.wordpress.callWp(
      `--wp-cli -instance-id ${instanceId} -- plugin update ${pluginName}`
    );

    revalidatePath("/wordpress");
    return {
      message: `Plugin ${pluginName} updated successfully`,
      success: true,
    };
  } catch (error) {
    console.error(`Error updating plugin ${pluginName}:`, error);
    return { message: `Failed to update plugin ${pluginName}`, success: false };
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
    await pleskApi.wordpress.callWp(
      `--wp-cli -instance-id ${instanceId} -- plugin ${action} ${pluginName}`
    );

    revalidatePath("/wordpress");
    return {
      message: `Plugin ${pluginName} ${activate ? "activated" : "deactivated"} successfully`,
      success: true,
    };
  } catch (error) {
    console.error(
      `Error ${activate ? "activating" : "deactivating"} plugin ${pluginName}:`,
      error
    );
    return {
      message: `Failed to ${activate ? "activate" : "deactivate"} plugin ${pluginName}`,
      success: false,
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
    return { message: "Backup created successfully", success: true };
  } catch (error) {
    console.error("Error creating backup:", error);
    return { message: "Failed to create backup", success: false };
  }
}

export async function createWordPressUser(
  instanceId: number,
  username: string,
  email: string,
  password: string,
  role = "subscriber"
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
    return { message: `User ${username} created successfully`, success: true };
  } catch (error) {
    console.error("Error creating WordPress user:", error);
    return { message: "Failed to create user", success: false };
  }
}

// Theme management actions
export async function activateTheme(instanceId: number, themeName: string) {
  try {
    const response = await pleskApi.wordpress.callWp(
      `--wp-cli -instance-id ${instanceId} -- theme activate ${themeName}`
    );

    revalidatePath("/wordpress");
    return { message: "Tema ativado com sucesso", success: true };
  } catch (error) {
    console.error("Error activating theme:", error);
    return { message: "Erro ao ativar tema", success: false };
  }
}

export async function updateTheme(instanceId: number, themeName: string) {
  try {
    const response = await pleskApi.wordpress.callWp(
      `--wp-cli -instance-id ${instanceId} -- theme update ${themeName}`
    );

    revalidatePath("/wordpress");
    return { message: "Tema atualizado com sucesso", success: true };
  } catch (error) {
    console.error("Error updating theme:", error);
    return { message: "Erro ao atualizar tema", success: false };
  }
}

export async function deleteTheme(instanceId: number, themeName: string) {
  try {
    const response = await pleskApi.wordpress.callWp(
      `--wp-cli -instance-id ${instanceId} -- theme delete ${themeName}`
    );

    revalidatePath("/wordpress");
    return { message: "Tema removido com sucesso", success: true };
  } catch (error) {
    console.error("Error deleting theme:", error);
    return { message: "Erro ao remover tema", success: false };
  }
}

export async function installTheme(instanceId: number, themeSlug: string) {
  try {
    const response = await pleskApi.wordpress.callWp(
      `--wp-cli -instance-id ${instanceId} -- theme install ${themeSlug}`
    );

    revalidatePath("/wordpress");
    return { message: "Tema instalado com sucesso", success: true };
  } catch (error) {
    console.error("Error installing theme:", error);
    return { message: "Erro ao instalar tema", success: false };
  }
}

// Helper functions for parsing wp-cli table output
function parseTableOutput(output: string): Record<string, string>[] {
  if (!output?.trim()) return [];

  const lines = output.trim().split("\n");
  if (lines.length < 2) return [];

  // First line contains headers
  const headerLine = lines[0];
  const headers = headerLine
    .split("\t")
    .map(h => h.trim())
    .filter(Boolean);

  const results: Record<string, string>[] = [];

  // Parse each data line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    console.log({ line });

    // Split by multiple spaces to separate columns
    const values = line.split("\t").map(v => v.trim());

    console.log({ values });

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    results.push(row);
  }

  return results;
}

function parseUserList(
  output: string
): Array<{ id: number; username: string; email: string; role: string }> {
  const rows = parseTableOutput(output);

  return rows.map(row => ({
    email: row.user_email || row.email || row.Email || "",
    id: Number.parseInt(row.ID || row.id || "0", 10),
    role: row.roles || row.role || row.Role || "subscriber",
    username: row.user_login || row.username || row.Username || "",
  }));
}

const pluginFields = [
  "update_id",
  "name",
  "title",
  "description",
  "status",
  "update",
  "version",
  "update_version",
  "auto_update",
];

const themeFields = [
  "name",
  "status",
  "update",
  "version",
  "update_version",
  "auto_update",
  "update_package",
  "update_id",
  "title",
  "description",
];
