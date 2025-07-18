"use server";

import { getUser } from "@/lib/auth";

interface CreateCoolifyApplicationParams {
  gitRepo: string;
  branch: string;
  buildCommand: string;
}

interface CreateWordPressApplicationParams {
  siteTitle: string;
  adminUsername: string;
  adminPassword: string;
  adminEmail: string;
}

// export async function createWordPressApplication(
//   params: CreateWordPressApplicationParams,
// ) {
//   try {
//     // Create a new MySQL database
//     const dbResponse = await coolifyApi.coolifyAxios.post("/databases", {
//       name: `${params.siteTitle}-db`,
//       type: "mysql",
//     });

//     const dbDetails = dbResponse.data;

//     // Create a new WordPress application
//     const wpResponse = await coolifyApi.coolifyAxios.post("/applications", {
//       name: params.siteTitle,
//       image: "wordpress:latest",
//       environment: {
//         WORDPRESS_DB_HOST: dbDetails.host,
//         WORDPRESS_DB_USER: dbDetails.user,
//         WORDPRESS_DB_PASSWORD: dbDetails.password,
//         WORDPRESS_DB_NAME: dbDetails.database,
//         WORDPRESS_TABLE_PREFIX: "wp_",
//         WORDPRESS_DEBUG: 0,
//         WORDPRESS_CONFIG_EXTRA: "",
//       },
//     });

//     return { success: true, data: wpResponse.data };
//   } catch (error) {
//     console.error("Error creating WordPress application:", error);
//     return { success: false, error: "Failed to create WordPress application" };
//   }
// }

// export async function getApplicationStats(applicationId: string) {
//   try {
//     const response = await coolifyApi.getApplicationStats(applicationId);
//     return { success: true, data: response };
//   } catch (error) {
//     return { success: false, error: "Failed to get application stats" };
//   }
// }

// export async function manageApplication(
//   applicationId: string,
//   action: "start" | "stop" | "delete",
// ) {
//   try {
//     let response;
//     switch (action) {
//       case "start":
//         response = await coolifyApi.coolifyAxios.post(
//           `/applications/${applicationId}/start`,
//         );
//         break;
//       case "stop":
//         response = await coolifyApi.coolifyAxios.post(
//           `/applications/${applicationId}/stop`,
//         );
//         break;
//       case "delete":
//         response = await coolifyApi.coolifyAxios.delete(
//           `/applications/${applicationId}`,
//         );
//         break;
//     }
//     return { success: true, data: response.data };
//   } catch (error) {
//     console.error(
//       `Error performing action ${action} on application ${applicationId}:`,
//       error,
//     );
//     return { success: false, error: `Failed to ${action} application` };
//   }
// }

interface CreateApplicationParams extends Omit<NixpacksBuildOptions, "name"> {
  repo: `${string}/${string}`;
  branch: string;
}

export async function createApplication(params: CreateApplicationParams) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Usuário não autenticado." };
    }

    const nixpacks = new NixpacksApi();
    const { repo, branch, ...buildOptions } = params;

    // TODO: Use branch
    const imageName = repo.split("/")[1];

    try {
      const app = await coolify.createPublicApplication({
        build_pack:
          Coolify.CreatePublicApplicationRequestBuildPackEnum.Nixpacks,
        git_repository: `https://github.com/${repo}.git`,
        git_branch: branch,
        project_uuid: "xk88444cs4g0g0g0kccw8wsc",
        server_uuid: "ogow0co0ggc8soos08kc4ksg",
        name: repo,
        environment_uuid: "awsokkk4c8ccowcckc40g44o",
        ports_exposes: "3000",
        instant_deploy: true,
        build_command: "pnpm build",
        install_command: "pnpm i",
        start_command: "pnpm preview",
      });
      console.log({ app });
    } catch (error) {
      console.error("Error creating application:", error.response.data);
      return { success: false, error: `Failed to create application` };
    }

    // const dockerfile = await nixpacks.genImageForRepo(user, repo, branch, {
    //   ...buildOptions,
    //   name: imageName,
    // });

    // await Bun.$`docker run ${repo} --name ${imageName}`;

    return { success: true };
  } catch (error) {
    console.error("Error creating application:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Falha ao criar a aplicação." };
  }
}
