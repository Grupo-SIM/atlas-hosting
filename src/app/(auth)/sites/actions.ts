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
  _params: CreateWordPressApplicationParams
) {
  try {
    const user = await getUser();
    if (!user) {
      return { error: "Usuário não autenticado.", success: false as const };
    }
    // TODO: implement WordPress creation
    return {
      error: "Funcionalidade ainda não implementada.",
      success: false as const,
    };
  } catch (error) {
    console.error("Error creating WordPress application:", error);
    return {
      error: "Failed to create WordPress application",
      success: false as const,
    };
  }
}

export async function getApplicationStats(applicationId: string) {
  try {
    const stats = await coolify.getApplicationStats(applicationId);
    return { data: stats, success: true as const };
  } catch (error) {
    return {
      error: "Failed to get application stats",
      success: false as const,
    };
  }
}

export async function manageApplication(
  applicationId: string,
  action: "start" | "stop" | "delete"
) {
  try {
    await coolify[
      action === "delete" ? "deleteApplication" : `${action}Application`
    ](applicationId);
    return { success: true };
  } catch (error) {
    console.error(
      `Error performing action ${action} on application ${applicationId}:`,
      error
    );
    return { error: `Failed to ${action} application`, success: false };
  }
}

export async function createApplication(params: CreateApplicationParams) {
  try {
    const user = await getUser();
    if (!user) {
      return { error: "Usuário não autenticado.", success: false };
    }

    const { repo, branch } = params;

    try {
      const app = await coolify.createPublicApplication({
        build_command: params.buildCmd ?? "pnpm build",
        build_pack: "nixpacks",
        environment_uuid: "awsokkk4c8ccowcckc40g44o",
        git_branch: branch,
        git_repository: `https://github.com/${repo}.git`,
        install_command: params.installCmd ?? "pnpm i",
        instant_deploy: true,
        name: repo,
        ports_exposes: "3000",
        project_uuid: "xk88444cs4g0g0g0kccw8wsc",
        server_uuid: "ogow0co0ggc8soos08kc4ksg",
        start_command: params.startCmd ?? "pnpm preview",
      });
      console.log({ app });
    } catch (error) {
      const axiosError = error as any;
      console.error("Error creating application:", axiosError?.response?.data);
      return { error: "Failed to create application", success: false };
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating application:", error);
    if (error instanceof Error) {
      return { error: error.message, success: false };
    }
    return { error: "Falha ao criar a aplicação.", success: false };
  }
}
