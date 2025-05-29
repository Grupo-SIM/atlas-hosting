// src/app/api/wp-install/route.ts
import { getUser } from "@/lib/auth/index";
import pleskApi from "@/lib/server/apis/plesk";
import { CliCallResponse, ClientRequestTypeEnum } from "@/plesk";

import { db } from "@/lib/db";
import { pgUser } from "@/lib/db/schema";
import namecheapApi from "@/lib/server/apis/namecheap";
import { DnsHostRecord } from "@/lib/server/apis/namecheap/types";
import axios from "axios";
import { eq } from "drizzle-orm";
import { AppLogger } from "@/lib/server/logs";
import { ELEMENTOR_PRO_PLUGIN_ID } from "@/lib/server/apis/plesk/wp-toolkit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Helper function to send SSE messages
function* sendSSE(
  type: "INFO" | "ERROR" | "SUCCESS" | "STEP",
  message: string,
  details?: any
) {
  const payload = { type, message, step: message, details }; // 'step' for frontend compatibility
  console.log("SSE Payload:", payload);
  const data = JSON.stringify(payload);
  yield `data: ${data}\n\n`;
}

export async function GET(request: Request) {
  const urlParams = new URL(request.url).searchParams;
  const domainName = urlParams.get("domain");
  const adminUsername = urlParams.get("admin_username");
  let adminPassword = urlParams.get("admin_password");
  let siteName = urlParams.get("site_name");
  let adminEmail = urlParams.get("admin_email");

  if (
    !domainName ||
    !adminUsername ||
    !adminPassword ||
    !siteName ||
    !adminEmail
  ) {
    return new Response(
      JSON.stringify({
        type: "ERROR",
        message: "Parâmetros ausentes na requisição.",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  adminPassword = decodeURIComponent(adminPassword);
  siteName = decodeURIComponent(siteName);
  adminEmail = decodeURIComponent(adminEmail);

  const user = await getUser();

  if (!user) {
    return new Response(
      JSON.stringify({ type: "ERROR", message: "Usuário não autenticado." }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response(
    // @ts-expect-error Bun async generators are compatible with Response body
    (async function* () {
      try {
        yield* sendSSE("INFO", "Iniciando a instalação do WordPress");

        let { pleskId } = user;
        const { id: userId, email: userEmailForPlesk } = user;

        if (!pleskId) {
          yield* sendSSE("INFO", "Criando usuário de hospedagem no sistema...");
          // const pleskClientPassword = user.password || "DefaultPassword123!"; // Fallback, ensure user.password is hashed if stored
          const pleskClientPassword = "Default#Password123"; // Fallback, ensure user.password is hashed if stored
          const result = await pleskApi.createClient({
            name: user.name,
            email: userEmailForPlesk,
            login: user.id.replaceAll("-", "").substring(0, 50), // Plesk login must be <= 50 characters
            password: pleskClientPassword,
            type: ClientRequestTypeEnum.Customer,
            status: 0,
          });

          yield* sendSSE("INFO", "Atualizando os dados do usuário...");
          if (result && result.id) {
            await db
              .update(pgUser)
              .set({ pleskId: result.id })
              .where(eq(pgUser.id, userId));
            pleskId = result.id;
            yield* sendSSE("INFO", "Usuário de hospedagem criado e vinculado.");
          } else {
            console.error("Failed to create Plesk client:", result);
            yield* sendSSE(
              "ERROR",
              "Erro ao criar usuário de hospedagem no sistema",
              result
            );
            return;
          }
        }

        yield* sendSSE("INFO", "Verificando e configurando domínio...");
        const existingDomainInPlesk = await pleskApi
          .getDomain(domainName)
          .catch(() => null);
        if (existingDomainInPlesk) {
          await pleskApi.deleteDomain(existingDomainInPlesk.id);
        }

        yield* sendSSE("INFO", `Criando assinatura para o domínio...`);

        await pleskApi.subscriptions.createSubscription({
          domainName,
          login: `${domainName.replace(/\./g, "_")}_${pleskId}`,
          password: `${adminPassword}_${pleskId}`,
          ownerLogin: user.id.replaceAll("-", "").substring(0, 50),
        });

        yield* sendSSE("INFO", `Assinatura criada.`);

        yield* sendSSE("INFO", "Configurando DNS...");
        let sld: string;
        let tld: string;
        const domainParts = domainName.split(".");
        if (domainParts.length < 2) {
          yield* sendSSE(
            "ERROR",
            "Formato de domínio inválido para configuração de DNS."
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
        ];
        if (
          domainParts.length > 2 &&
          commonSecondLevel.includes(
            domainParts[domainParts.length - 2].toLowerCase()
          )
        ) {
          tld = domainParts.slice(-2).join(".");
          sld = domainParts.slice(0, -2).join(".");
        } else {
          tld = domainParts.pop()!;
          sld = domainParts.join(".");
        }

        if (!sld) {
          yield* sendSSE(
            "ERROR",
            `Não foi possível determinar o SLD para o domínio: ${domainName}`
          );
          return;
        }

        const serverIp = process.env.SERVER_IP;
        if (!serverIp) {
          yield* sendSSE(
            "ERROR",
            "IP do servidor não configurado (SERVER_IP)."
          );
          return;
        }

        // yield* sendSSE("INFO", "Configurando certificado SSL...");
        // await pleskApi.subscriptions.getSsl(domainName, user);
        // yield* sendSSE("INFO", "Certificado SSL configurado.");

        yield* sendSSE(
          "INFO",
          "Instalando a instância do WordPress (isso pode demorar alguns segundos)..."
        );
        const wpInstallRawResult = await pleskApi.wordpress.installWp(
          domainName,
          adminUsername,
          adminPassword,
          siteName,
          adminEmail
        );
        const wpInstallResult = parsePleskCliResponse(wpInstallRawResult);
        const stdOut = JSON.parse(wpInstallResult.stdout || "{}");

        if (!stdOut["instance-id"]) {
          console.error("WordPress installation failed:", wpInstallResult);
          const errorMsg = String(
            wpInstallResult.stderr ||
              wpInstallResult.message ||
              wpInstallResult.error ||
              "Falha na instalação (código de saída)."
          );
          yield* sendSSE("ERROR", `Erro ao instalar o WordPress: ${errorMsg}`);
          return;
        }

        await pleskApi.wordpress.createAdminUser(+stdOut["instance-id"]);
        yield* sendSSE(
          "INFO",
          "Configurações adicionais do WordPress aplicadas."
        );

        const mainDnsRecord: DnsHostRecord[] = [
          { HostName: "@", RecordType: "A", Address: serverIp, TTL: 60 },
        ];

        const wwwDnsRecord: DnsHostRecord[] = [
          {
            HostName: "www",
            RecordType: "A",
            Address: serverIp,
            TTL: 60,
          },
        ];

        yield* sendSSE("INFO", `Configurando registro de DNS principal...`);

        await Promise.all([
          namecheapApi.createNameserver({
            SLD: sld,
            TLD: tld,
            Nameserver: `ns1.${domainName}`,
            IP: serverIp,
          }),
          namecheapApi.createNameserver({
            SLD: sld,
            TLD: tld,
            Nameserver: `ns2.${domainName}`,
            IP: serverIp,
          }),
        ]);

        // await namecheapApi.setHosts({
        //   SLD: sld,
        //   TLD: tld,
        //   Records: mainDnsRecord,
        // });

        // yield* sendSSE("INFO", "Carregando");
        // await new Promise((resolve) => setTimeout(resolve, 2000));

        // const dnsResult = await namecheapApi.setHosts({
        //   SLD: sld,
        //   TLD: tld,
        //   Records: wwwDnsRecord,
        // });

        // if (dnsResult.IsSuccess) {
        //   yield* sendSSE("INFO", "Registros DNS configurados com sucesso!");
        // } else {
        //   yield* sendSSE(
        //     "ERROR",
        //     "Falha ao configurar registros DNS.",
        //     dnsResult
        //   );
        //   return;
        // }

        yield* sendSSE("INFO", "Instalando plugins...");
        await pleskApi.wordpress.addPluginToWebsite(
          +stdOut["instance-id"],
          ELEMENTOR_PRO_PLUGIN_ID
        );

        const userLogger = new AppLogger(user);

        userLogger.log({
          title: "Instalação do WordPress",
          description: `Instância do WordPress criada com sucesso em ${domainName}.`,
          severity: "success",
          type: "hosting",
        });

        yield* sendSSE("SUCCESS", "Instalação concluída com sucesso!");
      } catch (error: any) {
        console.error("Erro geral no processo de instalação:", error);
        let errorMsg = "Erro desconhecido durante a instalação.";
        let errorDetails: any = {};
        if (axios.isAxiosError(error)) {
          errorDetails = error.response?.data;
          errorMsg = `Erro de API: ${error.response?.data?.message || error.message}`;
        } else if (error instanceof Error) {
          errorMsg = error.message;
        }
        yield* sendSSE(
          "ERROR",
          `Falha na instalação: ${errorMsg}`,
          errorDetails
        );
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
}

// Helper function to parse Plesk CLI JSON output (remains the same)
interface PleskCliOutput {
  stdout?: string;
  stderr?: string;
  exit_code?: number;
  message?: string;
  error?: string | boolean;
  status?: string;
  admin_url?: string;
  site_url?: string;
  [key: string]: any;
}

function parsePleskCliResponse(response: CliCallResponse): PleskCliOutput {
  let parsedOutput: PleskCliOutput = {
    stderr: response.stderr || "",
    exit_code:
      response.code === 200 && !response.stderr ? 0 : response.code || -1,
  };
  try {
    if (response.stdout) {
      const jsonOutput = JSON.parse(response.stdout);
      parsedOutput = {
        ...parsedOutput,
        ...jsonOutput,
        stdout: response.stdout,
      };
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
    if (!parsedOutput.message && !parsedOutput.error && response.stderr) {
      parsedOutput.error = response.stderr;
    } else if (!parsedOutput.message && !parsedOutput.error) {
      parsedOutput.error = `Invalid or non-JSON response from server: ${response.stdout}`;
    }
  }
  return parsedOutput;
}
