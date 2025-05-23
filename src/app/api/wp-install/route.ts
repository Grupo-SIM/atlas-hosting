// TODO: replace (yield ) with yield* send
import { getUser } from "@/lib/auth/index";
import pleskApi from "@/lib/server/apis/plesk";
import { CliCallResponse, ClientRequestTypeEnum } from "@/plesk";

import { db } from "@/lib/db";
import { userTable } from "@/lib/db/schema";
import desecApi from "@/lib/server/apis/desec";
import nameSilo, { NamesiloApi } from "@/lib/server/apis/namesilo";
import axios from "axios";
import { eq } from "drizzle-orm";
import { DnsHostRecord } from "@/lib/server/apis/namecheap/types";
import namecheapApi from "@/lib/server/apis/namecheap";

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

  function* send(
    type: "INFO" | "ERROR" | "SUCCESS" | "STEP",
    message: string,
    details?: any
  ) {
    yield* sendSSE(type, message, details);
  }

  const response = new Response(
    // @ts-expect-error Bun async generators are not typed
    (async function* () {
      const currentStep = 0;

      // Step 1: Starting installation
      yield* send("INFO", "Iniciando a instalação do WordPress");

      if (!user) {
        yield* send("ERROR", "Usuário não autenticado");
        return;
      }

      let { pleskId, namesiloId } = user;
      const { id: userId } = user;

      if (!domainName) {
        yield* send("ERROR", `Nome de domínio não fornecido`);
        return;
      }

      if (!pleskId) {
        // Step 2: Creating hosting user
        yield* send("INFO", `Criando usuário de hospedagem no sistema`);

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
        yield* send("INFO", `Atualizando os dados do usuário`);

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
          yield* send(
            "ERROR",
            `Erro ao criar usuário de hospedagem no sistema`
          );
          return;
        }
      }

      if (!namesiloId) {
        // Step 4: Creating Namesilo contact
        yield* send("INFO", `Configurando registro de domínio`);

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
        yield* send("INFO", `Atualizando os dados do domínio`);

        const domainExists = await pleskApi.getDomain(domainName);

        if (domainExists) {
          await pleskApi.deleteDomain(domainExists.id);
        }

        await pleskApi.subscriptions.createSubscription({
          domainName,
          login: domainName.replace(".", "_").concat("_", user.pleskId!),
          password: adminPassword.concat(`_${user.pleskId!}`),
        });

        yield* send("INFO", "Configurando DNS");

        let sld: string;
        let tld: string;
        const domainParts = domainName.split(".");

        if (domainParts.length < 2) {
          yield* send(
            "ERROR",
            `Formato de domínio inválido para configuração de DNS.`
          );
          return;
        }

        const commonSecondLevel = [
          "co",
          "com",
          "org",
          "net",
          "gov",
          "ac",
          "edu",
        ]; // Add more if needed
        if (
          domainParts.length > 2 &&
          commonSecondLevel.includes(
            domainParts[domainParts.length - 2].toLowerCase()
          )
        ) {
          // Handles cases like 'example.co.uk' -> SLD: 'example', TLD: 'co.uk'
          tld = domainParts.slice(-2).join(".");
          sld = domainParts.slice(0, -2).join(".");
        } else {
          // Handles cases like 'example.com' -> SLD: 'example', TLD: 'com'
          tld = domainParts.pop()!;
          sld = domainParts.join(".");
        }

        if (!sld) {
          // Handles cases like ".com" or if SLD becomes empty after split
          yield* send(
            "ERROR",
            `Não foi possível determinar o SLD para o domínio: ${domainName}`
          );
          return;
        }

        const serverIp = process.env.SERVER_IP;
        if (!serverIp) {
          yield* send(
            "ERROR",
            "IP do servidor não configurado nas variáveis de ambiente (SERVER_IP)."
          );
          return;
        }

        const dnsRecords: DnsHostRecord[] = [
          { HostName: "@", RecordType: "A", Address: serverIp, TTL: 1800 },
          { HostName: "www", RecordType: "A", Address: serverIp, TTL: 1800 },
        ];

        try {
          const dnsResult = await namecheapApi.setHosts({
            SLD: sld,
            TLD: tld,
            Records: dnsRecords,
          });

          if (dnsResult.IsSuccess) {
            send("INFO", `Registros DNS para configurados com sucesso.`);
          } else {
            // Even if IsSuccess is false, Namecheap API might not throw an error but return it in the response.
            // The _makeRequest should throw for Status="ERROR" in ApiResponse.
            // This path might be if ApiResponse Status="OK" but CommandResponse indicates logical failure.
            yield* send(
              "ERROR",
              `Falha ao configurar registros DNS.`,
              dnsResult
            );
            return;
          }
        } catch (dnsError: any) {
          yield* send(
            "ERROR",
            `Erro ao configurar DNS: ${dnsError.message || "Erro desconhecido"}`,
            dnsError
          );
          return;
        }

        yield* send("INFO", "Configurando certificado SSL");
        await pleskApi.subscriptions.getSsl(domainName, user);

        // Step 6: Installing WordPress
        yield* send(
          "INFO",
          "Instalando a instância do WordPress (isso pode demorar alguns segundos)"
        );

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

          yield* send("ERROR", `Erro ao instalar o WordPress: ${errorMessage}`);
          return;
        }

        if (
          wpInstallResult.error &&
          typeof wpInstallResult.error === "boolean"
        ) {
          yield* send(
            "ERROR",
            "Erro ao instalar o WordPress: A instalação reportou um erro."
          );
          return;
        }

        if (
          wpInstallResult.error &&
          typeof wpInstallResult.error === "string" &&
          wpInstallResult.error.toLowerCase() !== "false"
        ) {
          yield* send(
            "ERROR",
            `Erro ao instalar o WordPress: ${wpInstallResult.error}`
          );
          return;
        }

        if (
          wpInstallResult.status &&
          !["success", "installed", "ok"].includes(
            wpInstallResult.status.toLowerCase()
          )
        ) {
          yield* send(
            "ERROR",
            `Erro ao instalar o WordPress: ${wpInstallResult.status}`
          );
          return;
        }

        await pleskApi.wordpress.createAdminUser(+stdOut["instance-id"]);

        await pleskApi.wordpress.addWpConfig(+stdOut["instance-id"], {
          SIMPLE_JWT_AUTH_ENCRYPT_KEY: process.env.JWT_AUTH_SECRET!,
        });

        // Final success message
        yield* send("SUCCESS", "Instalação concluída com sucesso!");
        return;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Failed to create WordPress instance:", error);
          if (error.response && error.response.data) {
            const pleskError = error.response.data as any;
            yield* send(
              "ERROR",
              `Erro durante a criação da instância WordPress: ${pleskError.message || pleskError.errtext || JSON.stringify(pleskError)}`
            );
            return;
          }
        }

        yield* send("ERROR", "Erro ao criar instância WordPress");
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
  [key: string]: any; // For other potential fields
}

function* sendSSE(
  type: "INFO" | "ERROR" | "SUCCESS" | "STEP",
  message: string,
  details?: any
) {
  const payload = { type, message, step: message, details };

  console.log("SSE Payload:", payload);

  const data = JSON.stringify(payload); // 'step' for compatibility if frontend uses it
  yield `data: ${data}\n\n`;
}
