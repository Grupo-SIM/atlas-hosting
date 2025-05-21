import { getUser } from "@/lib/auth/index";
import pleskApi from "@/lib/server/apis/plesk";
import { CliCallResponse, ClientRequestTypeEnum } from "@/plesk";

import { db } from "@/lib/db";
import { userTable } from "@/lib/db/schema";
import desecApi from "@/lib/server/apis/desec";
import nameSilo, { NamesiloApi } from "@/lib/server/apis/namesilo";
import axios from "axios";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Total number of steps in the installation process
const TOTAL_STEPS = 7;

export async function GET(request: Request) {
  const domainName = new URL(request.url).searchParams.get("domain");
  const adminUsername = new URL(request.url).searchParams.get("admin_username");
  let adminPassword = new URL(request.url).searchParams.get("admin_password");
  let siteName = new URL(request.url).searchParams.get("site_name");

  if (!domainName || !adminUsername || !adminPassword || !siteName) {
    return Response.error();
  }

  adminPassword = decodeURIComponent(adminPassword);
  siteName = decodeURIComponent(siteName);

  const user = await getUser();

  if (!user) {
    return Response.error();
  }

  const response = new Response(
    // @ts-expect-error Bun async generators are not typed
    (async function* () {
      let currentStep = 0;

      // Step 1: Starting installation
      yield `data: ${JSON.stringify({ step: ++currentStep, total: TOTAL_STEPS, message: "Iniciando a instalação do WordPress" })}\n\n`;

      if (!user) {
        yield `data: ${JSON.stringify({ error: "Usuário não autenticado" })}\n\n`;
        return;
      }

      let { pleskId, namesiloId } = user;
      const { id: userId } = user;

      if (!domainName) {
        yield `data: ${JSON.stringify({ error: "Nome de domínio não fornecido" })}\n\n`;
        return;
      }

      if (!pleskId) {
        // Step 2: Creating hosting user
        yield `data: ${JSON.stringify({ step: ++currentStep, total: TOTAL_STEPS, message: "Criando usuário de hospedagem no sistema" })}\n\n`;

        const result = await pleskApi.createClient({
          name: user.name,
          email: user.email,
          login: user.email,
          password: user.password,
          type: ClientRequestTypeEnum.Customer,
          externalId: userId,
          ownerLogin: "atlashosting",
          status: 0,
        });

        // Step 3: Updating user data
        yield `data: ${JSON.stringify({ step: ++currentStep, total: TOTAL_STEPS, message: "Atualizando os dados do usuário" })}\n\n`;

        if (result && result.id) {
          await db
            .update(userTable)
            .set({
              pleskId: result.id,
            })
            .where(eq(userTable.id, userId));

          pleskId = result.id;
        } else {
          console.error("Failed to create Plesk client:", result);
          yield `data: ${JSON.stringify({ error: "Erro ao criar usuário de hospedagem no sistema" })}\n\n`;
          return;
        }
      }

      if (!namesiloId) {
        // Step 4: Creating Namesilo contact
        yield `data: ${JSON.stringify({ step: ++currentStep, total: TOTAL_STEPS, message: "Configurando registro de domínio" })}\n\n`;

        namesiloId = await nameSilo.createContact();

        await db
          .update(userTable)
          .set({
            namesiloId,
          })
          .where(eq(userTable.id, userId));
      }

      try {
        // Step 5: Updating domain data
        yield `data: ${JSON.stringify({ step: ++currentStep, total: TOTAL_STEPS, message: "Atualizando os dados do domínio" })}\n\n`;

        const domainExists = await pleskApi.getDomain(domainName);

        if (!domainExists) {
          await pleskApi.subscriptions.createSubscription({
            domainName,
            login: domainName.replace(".", "_").concat("_", user.pleskId!),
            password: adminPassword,
          });
        }

        // Step 6: Installing WordPress
        yield `data: ${JSON.stringify({ step: ++currentStep, total: TOTAL_STEPS, message: "Instalando a instância do WordPress (isso pode demorar alguns segundos)" })}\n\n`;

        const wpInstallRawResult = await pleskApi.wordpress.installWp(
          domainName,
          adminUsername,
          adminPassword,
          siteName,
          user.email
        );
        const wpInstallResult = parsePleskCliResponse(wpInstallRawResult);

        const stdOut = JSON.parse(wpInstallResult.stdout || "{}");

        if (!stdOut["instance-id"]) {
          console.error(
            "WordPress installation failed (WP Toolkit exit code):",
            wpInstallResult
          );
          const errorMessage = String(
            wpInstallResult.stderr ||
              wpInstallResult.message ||
              wpInstallResult.error ||
              "Falha na instalação (código de saída)."
          );

          yield `data: ${JSON.stringify({ error: `Erro ao instalar o WordPress: ${errorMessage}` })}\n\n`;
          return;
        }

        if (
          wpInstallResult.error &&
          typeof wpInstallResult.error === "boolean"
        ) {
          yield `data: ${JSON.stringify({ error: "Erro ao instalar o WordPress: A instalação reportou um erro." })}\n\n`;
          return;
        }

        if (
          wpInstallResult.error &&
          typeof wpInstallResult.error === "string" &&
          wpInstallResult.error.toLowerCase() !== "false"
        ) {
          yield `data: ${JSON.stringify({ error: `Erro ao instalar o WordPress: ${wpInstallResult.error}` })}\n\n`;
          return;
        }

        if (
          wpInstallResult.status &&
          !["success", "installed", "ok"].includes(
            wpInstallResult.status.toLowerCase()
          )
        ) {
          yield `data: ${JSON.stringify({ error: `Erro ao instalar o WordPress: ${wpInstallResult.status}` })}\n\n`;
          return;
        }

        await pleskApi.wordpress.createAdminUser(+stdOut["instance-id"]);

        await pleskApi.wordpress.addWpConfig(+stdOut["instance-id"], {
          SIMPLE_JWT_AUTH_ENCRYPT_KEY: process.env.JWT_AUTH_SECRET!,
        });

        // Step 7: Configuring DNS and SSL
        yield `data: ${JSON.stringify({ step: ++currentStep, total: TOTAL_STEPS, message: "Configurando DNS" })}\n\n`;

        try {
          await nameSilo.addDnsRecord({
            domain: domainName,
            host: "@",
            type: "A",
            value: process.env.SERVER_IP!,
          });

          await nameSilo.addDnsRecord({
            domain: domainName,
            host: "www",
            type: "A",
            value: process.env.SERVER_IP!,
          });

          // const dynv6Api = axios.create({
          //   baseURL: "https://dynv6.com/api/v2",
          //   headers: {
          //     Authorization: `Bearer ${process.env.DYNV6_TOKEN}`,
          //   },
          // });

          // let { data } = await dynv6Api.post("/zones", {
          //   name: domainName,
          //   ipv4address: process.env.SERVER_IP!,
          // });

          // console.log(data);

          // const zoneId = data.id;

          // data = (
          //   await dynv6Api.post(`/zones/${zoneId}/records`, {
          //     name: domainName,
          //     type: "A",
          //     data: process.env.SERVER_IP!,
          //   })
          // ).data;

          // console.log(data);

          // data = (
          //   await dynv6Api.post(`/zones/${zoneId}/records`, {
          //     name: `www.${domainName}`,
          //     type: "A",
          //     data: process.env.SERVER_IP!,
          //   })
          // ).data;

          // console.log(data);

          // await desecApi.domains
          //   .createDomain({
          //     name: domainName,
          //   })
          //   .catch();

          // await desecApi.rrsets
          //   .bulkModifyRRsets(domainName, [
          //     {
          //       subname: "",
          //       records: [process.env.SERVER_IP!],
          //       ttl: 3600,
          //       type: "A",
          //     },
          //     {
          //       subname: "www",
          //       records: [process.env.SERVER_IP!],
          //       ttl: 3600,
          //       type: "A",
          //     },
          //   ])
          //   .catch();

          // (async () => {
          //   await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
          //   await pleskApi.subscriptions.getSsl(domainName, user);
          // })();
        } catch (err) {
          // Ignore DNS/SSL errors as they can be configured later
        }

        // Final success message
        yield `data: ${JSON.stringify({ step: TOTAL_STEPS, total: TOTAL_STEPS, message: "Instalação concluída com sucesso!", success: true })}\n\n`;
        return;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Failed to create WordPress instance:", error);
          if (error.response && error.response.data) {
            const pleskError = error.response.data as any;
            yield `data: ${JSON.stringify({ error: `Erro durante a criação da instância WordPress: ${pleskError.message || pleskError.errtext || JSON.stringify(pleskError)}` })}\n\n`;
            return;
          }
        }

        yield `data: ${JSON.stringify({ error: "Erro ao criar instância WordPress" })}\n\n`;
        return;
      }
    })(),
    {
      headers: {
        Connection: "keep-alive",
        "Content-Encoding": "none",
        "Cache-Control": "no-cache, no-transform",
        "Content-Type": "text/event-stream; charset=utf-8",
      },
    }
  );

  return response;
}

function parsePleskCliResponse(response: CliCallResponse): PleskCliOutput {
  let parsedOutput: PleskCliOutput = {
    stderr: response.stderr || "",
    exit_code: response.code === 200 && !response.stderr ? 0 : -1,
  };

  try {
    if (response.stdout) {
      const jsonOutput = JSON.parse(response.stdout);
      parsedOutput = { ...parsedOutput, ...jsonOutput };
      parsedOutput.stdout = response.stdout;

      if (jsonOutput.result && typeof jsonOutput.result === "object") {
        parsedOutput.admin_url =
          jsonOutput.result.admin_url || parsedOutput.admin_url;
        parsedOutput.site_url =
          jsonOutput.result.site_url || parsedOutput.site_url;
      }
      parsedOutput.admin_url = jsonOutput.admin_url || parsedOutput.admin_url;
      parsedOutput.site_url = jsonOutput.site_url || parsedOutput.site_url;

      if (typeof jsonOutput.exit_code === "number") {
        parsedOutput.exit_code = jsonOutput.exit_code;
      }
    } else {
      parsedOutput.stdout = "";
    }
  } catch (e) {
    console.warn("Failed to parse Plesk CLI stdout as JSON:", response.stdout);
    parsedOutput.stdout = response.stdout || "";
    if (!parsedOutput.message && !parsedOutput.error) {
      parsedOutput.error = `Invalid JSON response from server: ${response.stdout}`;
    }
  }
  return parsedOutput;
}

interface PleskCliOutput {
  stdout?: string; // Raw stdout
  stderr?: string;
  exit_code?: number; // WP Toolkit might put exit_code inside the JSON stdout
  message?: string; // General message from WP Toolkit
  error?: string | boolean; // Error message or flag
  status?: string; // Status like 'success', 'installed', 'error'
  admin_url?: string; // WordPress Admin URL
  site_url?: string; // WordPress Site URL
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // For other potential fields
}
