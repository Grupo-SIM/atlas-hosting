"use server";

import coolifyApi from "@/lib/server/apis/coolify";

interface CreateCoolifyApplicationParams {
  gitRepo: string;
  branch: string;
  buildCommand: string;
}

export async function createCoolifyApplication(params: CreateCoolifyApplicationParams) {
  try {
    const response = await coolifyApi.coolifyAxios.post("/applications", {
      name: params.gitRepo.split("/").pop()?.replace(".git", ""),
      git_repository: params.gitRepo,
      git_branch: params.branch,
      build_pack: "node",
      build_command: params.buildCommand,
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error creating Coolify application:", error);
    return { success: false, error: "Failed to create application" };
  }
}

interface CreateWordPressApplicationParams {
  siteTitle: string;
  adminUsername: string;
  adminPassword: string;
  adminEmail: string;
}

export async function createWordPressApplication(params: CreateWordPressApplicationParams) {
  try {
    // Create a new MySQL database
    const dbResponse = await coolifyApi.coolifyAxios.post("/databases", {
      name: `${params.siteTitle}-db`,
      type: "mysql",
    });

    const dbDetails = dbResponse.data;

    // Create a new WordPress application
    const wpResponse = await coolifyApi.coolifyAxios.post("/applications", {
      name: params.siteTitle,
      image: "wordpress:latest",
      environment: {
        WORDPRESS_DB_HOST: dbDetails.host,
        WORDPRESS_DB_USER: dbDetails.user,
        WORDPRESS_DB_PASSWORD: dbDetails.password,
        WORDPRESS_DB_NAME: dbDetails.database,
        WORDPRESS_TABLE_PREFIX: "wp_",
        WORDPRESS_DEBUG: 0,
        WORDPRESS_CONFIG_EXTRA: "",
      },
    });

    return { success: true, data: wpResponse.data };
  } catch (error) {
    console.error("Error creating WordPress application:", error);
    return { success: false, error: "Failed to create WordPress application" };
  }
}

export async function getApplicationStats(applicationId: string) {
  try {
    const response = await coolifyApi.getApplicationStats(applicationId);
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: "Failed to get application stats" };
  }
}

export async function manageApplication(applicationId: string, action: "start" | "stop" | "delete") {
  try {
    let response;
    switch (action) {
      case "start":
        response = await coolifyApi.coolifyAxios.post(`/applications/${applicationId}/start`);
        break;
      case "stop":
        response = await coolifyApi.coolifyAxios.post(`/applications/${applicationId}/stop`);
        break;
      case "delete":
        response = await coolifyApi.coolifyAxios.delete(`/applications/${applicationId}`);
        break;
    }
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`Error performing action ${action} on application ${applicationId}:`, error);
    return { success: false, error: `Failed to ${action} application` };
  }
}
