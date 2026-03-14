"use server";

import { getUser } from "@/lib/auth";

interface CreateApplicationParams {
  repo: `${string}/${string}`;
  branch: string;
  installCmd?: string;
  buildCmd?: string;
  startCmd?: string;
}

// Dummy coolify until implemented
const coolify: any = {
  createPublicApplication: async (_params: any) => ({ uuid: "dummy" }),
};

interface CreateWordPressApplicationParams {
  siteTitle: string;
  adminUsername: string;
  adminPassword: string;
  adminEmail: string;
}

export async function createWordPressApplication(
  _params: CreateWordPressApplicationParams,
) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false as const, error: "Usuário não autenticado." };
    }
    // TODO: implement WordPress creation
    return { success: false as const, error: "Funcionalidade ainda não implementada." };
  } catch (error) {
    console.error("Error creating WordPress application:", error);
    return { success: false as const, error: "Failed to create WordPress application" };
  }
}

export async function getApplicationStats(applicationId: string) {
  try {
    const stats = await coolify.getApplicationStats(applicationId);
    return { success: true as const, data: stats };
  } catch (error) {
    return { success: false as const, error: "Failed to get application stats" };
  }
}

export async function manageApplication(
  applicationId: string,
  action: "start" | "stop" | "delete",
) {
  try {
    await coolify[action === "delete" ? "deleteApplication" : `${action}Application`](applicationId);
    return { success: true };
  } catch (error) {
    console.error(`Error performing action ${action} on application ${applicationId}:`, error);
    return { success: false, error: `Failed to ${action} application` };
  }
}

export async function createApplication(params: CreateApplicationParams) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Usuário não autenticado." };
    }

    const { repo, branch } = params;

    try {
      const app = await coolify.createPublicApplication({
        build_pack: "nixpacks",
        git_repository: `https://github.com/${repo}.git`,
        git_branch: branch,
        project_uuid: "xk88444cs4g0g0g0kccw8wsc",
        server_uuid: "ogow0co0ggc8soos08kc4ksg",
        name: repo,
        environment_uuid: "awsokkk4c8ccowcckc40g44o",
        ports_exposes: "3000",
        instant_deploy: true,
        build_command: params.buildCmd ?? "pnpm build",
        install_command: params.installCmd ?? "pnpm i",
        start_command: params.startCmd ?? "pnpm preview",
      });
      console.log({ app });
    } catch (error) {
      const axiosError = error as any;
      console.error("Error creating application:", axiosError?.response?.data);
      return { success: false, error: `Failed to create application` };
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating application:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Falha ao criar a aplicação." };
  }
}
