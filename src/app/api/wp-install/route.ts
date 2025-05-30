// src/app/api/wp-install/route.ts
import { getUser } from "@/lib/auth/index";
import pleskApi from "@/lib/server/apis/plesk";
import { type CliCallResponse, ClientRequestTypeEnum } from "@/plesk";
import type { DnsRecord as PleskDnsRecord } from "@/plesk/models"; // Corrected import path

import { db } from "@/lib/db";
import { pgUser } from "@/lib/db/schema";
import namecheapApi from "@/lib/server/apis/namecheap";
import type {
  DnsHostRecord,
  DnsRecordType as NamecheapDnsRecordType,
} from "@/lib/server/apis/namecheap/types";
import axios from "axios";
import { eq } from "drizzle-orm";
import { AppLogger } from "@/lib/server/logs";
import { ELEMENTOR_PRO_PLUGIN_ID } from "@/lib/server/apis/plesk/wp-toolkit";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Helper function to send SSE messages
function* sendSSE(
  type: "INFO" | "ERROR" | "SUCCESS" | "STEP",
  message: string,
  details?: unknown
) {
  const payload = { type, message, step: message, details }; // 'step' for frontend compatibility
  // console.log("SSE Payload:", payload); // Kept for server-side debugging if needed
  const data = JSON.stringify(payload);
  yield `data: ${data}\n\n`;
}

// Helper function to transform Plesk host to Namecheap HostName
function transformPleskHostToNamecheapHostName(
  pleskHost: string,
  domainName: string
): string {
  const normalizedDomain = domainName.toLowerCase();
  let host = pleskHost.toLowerCase();

  const fullDomainPattern1 = `.${normalizedDomain}.`;
  const fullDomainPattern2 = `.${normalizedDomain}`;
  const apexPattern1 = `${normalizedDomain}.`; // e.g., example.com.
  const apexPattern2 = `${normalizedDomain}`; // e.g., example.com

  if (host.endsWith(fullDomainPattern1)) {
    host = host.substring(0, host.length - fullDomainPattern1.length);
  } else if (host.endsWith(fullDomainPattern2) && host !== fullDomainPattern2) {
    // ensure it's not just ".example.com"
    host = host.substring(0, host.length - fullDomainPattern2.length);
  } else if (host === apexPattern1 || host === apexPattern2) {
    host = "@";
  } else {
    // Fallback for other subdomain patterns, remove trailing domain part
    const domainToTrim = `.${normalizedDomain}`;
    if (host.endsWith(domainToTrim)) {
      host = host.substring(0, host.length - domainToTrim.length);
    }
  }

  // Remove any remaining trailing dot from the host part
  if (host.endsWith(".") && host !== "@") {
    host = host.substring(0, host.length - 1);
  }

  return host === "" ? "@" : host; // if host became empty, it's apex.
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
    // Not using SSE here as it's a preliminary check before stream starts
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
        yield* sendSSE("INFO", "Iniciando a instalação do WordPress...");

        let { pleskId } = user;
        const { id: userId, email: userEmailForPlesk } = user;

        if (!pleskId) {
          yield* sendSSE("INFO", "Criando usuário de hospedagem no sistema...");
          const pleskClientPassword = "Default#Password123";
          const result = await pleskApi.createClient({
            name: user.name,
            email: userEmailForPlesk,
            login: user.id.replaceAll("-", "").substring(0, 50),
            password: pleskClientPassword,
            type: ClientRequestTypeEnum.Customer,
            status: 0,
          });

          yield* sendSSE("INFO", "Atualizando os dados do usuário...");
          if (result?.id) {
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

        yield* sendSSE(
          "INFO",
          "Verificando e configurando domínio em Plesk..."
        );
        const existingDomainInPlesk = await pleskApi
          .getDomain(domainName)
          .catch(() => null);
        if (existingDomainInPlesk) {
          yield* sendSSE(
            "INFO",
            `Domínio ${domainName} existente encontrado em Plesk (ID: ${existingDomainInPlesk.id}). Removendo antes de recriar...`
          );
          await pleskApi.deleteDomain(existingDomainInPlesk.id);
          yield* sendSSE("INFO", `Domínio ${domainName} removido de Plesk.`);
        }

        yield* sendSSE(
          "INFO",
          `Criando assinatura para o domínio ${domainName} em Plesk...`
        );
        await pleskApi.subscriptions.createSubscription({
          domainName,
          login: `${domainName.replace(/\./g, "_")}_${pleskId}`,
          password: `${adminPassword}_${pleskId}`, // Consider a more robust password generation strategy
          ownerLogin: user.id.replaceAll("-", "").substring(0, 50),
        });
        yield* sendSSE(
          "INFO",
          `Assinatura criada para ${domainName} em Plesk.`
        );

        // SLD and TLD determination (from user's original file)
        let sld: string;
        let tld: string;
        const domainParts = domainName.split(".");
        if (domainParts.length < 2) {
          yield* sendSSE(
            "ERROR",
            `Formato de domínio inválido para configuração de DNS: ${domainName}`
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
          tld = domainParts.pop()?.toLowerCase() || "";
          sld = domainParts.join(".");
        }

        if (!sld) {
          yield* sendSSE(
            "ERROR",
            `Não foi possível determinar o SLD para o domínio: ${domainName}`
          );
          return;
        }
        yield* sendSSE(
          "INFO",
          `SLD: ${sld}, TLD: ${tld} determinados para ${domainName}.`
        );

        const serverIp = process.env.SERVER_IP; // This is used by Plesk WP Toolkit, not directly for Namecheap sync here
        if (!serverIp) {
          yield* sendSSE(
            "ERROR",
            "IP do servidor não configurado (SERVER_IP), necessário para a instalação do WordPress em Plesk."
          );
          return;
        }

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
          yield* sendSSE(
            "ERROR",
            `Erro ao instalar o WordPress: ${errorMsg}`,
            wpInstallResult
          );
          return;
        }
        yield* sendSSE(
          "SUCCESS",
          `WordPress instalado com sucesso! ID da Instância: ${stdOut["instance-id"]}`
        );

        yield* sendSSE(
          "INFO",
          "Criando usuário administrador adicional no WordPress..."
        );
        await pleskApi.wordpress.createAdminUser(+stdOut["instance-id"]);
        yield* sendSSE(
          "INFO",
          "Configurações adicionais do WordPress aplicadas."
        );

        // ----- START: Full DNS Synchronization with Namecheap -----
        yield* sendSSE(
          "INFO",
          `Iniciando sincronização de DNS de Plesk para Namecheap para o domínio ${domainName}...`
        );

        let pleskDnsRecords: PleskDnsRecord[];
        try {
          const response = await pleskApi.dnsApi.dnsRecordsGet(domainName);
          pleskDnsRecords = response.data;
          yield* sendSSE(
            "INFO",
            `Foram obtidos ${pleskDnsRecords.length} registros DNS do Plesk.`
          );
        } catch (error) {
          console.error(
            `Erro ao buscar registros DNS no Plesk para ${domainName}:`,
            error
          );
          let errorDetails = {};
          let status = 500;
          if (axios.isAxiosError(error)) {
            errorDetails = error.response?.data || {};
            status = error.response?.status || 500;
          } else if (error instanceof Error) {
            errorDetails = { message: error.message };
          }
          yield* sendSSE(
            "ERROR",
            `Falha ao buscar registros DNS no Plesk (HTTP ${status}).`,
            errorDetails
          );
          // Depending on severity, you might want to 'return' here or let plugin install proceed with a warning.
          // For now, we'll let it proceed but Namecheap sync will be skipped.
          pleskDnsRecords = []; // Ensure it's an empty array to skip Namecheap update
        }

        if (pleskDnsRecords.length > 0) {
          const namecheapDnsEntries: DnsHostRecord[] = [];
          const skippedRecordTypes: Set<string> = new Set();
          const supportedNamecheapTypes = new Set<NamecheapDnsRecordType>([
            "A",
            "AAAA",
            "ALIAS",
            "CAA",
            "CNAME",
            "MX",
            "MXE",
            "TXT",
            "URL",
            "URL301",
            "FRAME",
          ]);

          for (const pleskRecord of pleskDnsRecords) {
            if (!pleskRecord.type) {
              continue;
            }

            const recordTypeUpper = pleskRecord.type.toUpperCase();

            if (
              !supportedNamecheapTypes.has(
                recordTypeUpper as NamecheapDnsRecordType
              )
            ) {
              if (recordTypeUpper === "SRV") {
                yield* sendSSE(
                  "INFO",
                  `Registro SRV ignorado (host: ${pleskRecord.host}, valor: ${pleskRecord.value} ${pleskRecord.opt}) pois não é diretamente suportado.`
                );
              } else {
                yield* sendSSE(
                  "INFO",
                  `Tipo de registro DNS '${pleskRecord.type}' ignorado (host: ${pleskRecord.host}) pois não está na lista de tipos suportados pelo Namecheap setHosts.`
                );
              }
              skippedRecordTypes.add(pleskRecord.type);
              continue;
            }

            if (!pleskRecord.host) {
              yield* sendSSE(
                "INFO",
                `Registro DNS sem host definido (tipo: ${pleskRecord.type}, valor: ${pleskRecord.value}) ignorado.`
              );
              continue;
            }
            if (!pleskRecord.value) {
              yield* sendSSE(
                "INFO",
                `Registro DNS sem valor definido (tipo: ${pleskRecord.type}, host: ${pleskRecord.host}) ignorado.`
              );
            }

            const hostName = transformPleskHostToNamecheapHostName(
              pleskRecord.host,
              domainName
            );

            if (!pleskRecord.value) {
              return;
            }

            const namecheapEntry: DnsHostRecord = {
              HostName: hostName,
              RecordType: recordTypeUpper as NamecheapDnsRecordType,
              Address: pleskRecord.value,
              TTL: 1800, // Namecheap's default TTL
            };

            if (recordTypeUpper === "MX" && pleskRecord.opt) {
              const mxPref = Number.parseInt(pleskRecord.opt, 10);
              if (!Number.isNaN(mxPref)) {
                namecheapEntry.MXPref = mxPref;
              } else {
                yield* sendSSE(
                  "INFO",
                  `Não foi possível converter MXPref para o host ${pleskRecord.host}: ${pleskRecord.opt}`
                );
              }
            }
            namecheapDnsEntries.push(namecheapEntry);
          }

          if (namecheapDnsEntries.length > 0) {
            yield* sendSSE(
              "INFO",
              `Total de ${namecheapDnsEntries.length} registros DNS transformados para o formato Namecheap.`
            );
            if (skippedRecordTypes.size > 0) {
              yield* sendSSE(
                "INFO",
                `Tipos de registros DNS ignorados: ${Array.from(skippedRecordTypes).join(", ")}`
              );
            }

            try {
              yield* sendSSE(
                "INFO",
                `Enviando ${namecheapDnsEntries.length} registros DNS para Namecheap...`
              );
              const namecheapResponse = await namecheapApi.setHosts({
                SLD: sld,
                TLD: tld,
                Records: namecheapDnsEntries,
              });

              if (namecheapResponse.IsSuccess) {
                yield* sendSSE(
                  "SUCCESS",
                  `Registros DNS para ${domainName} atualizados com sucesso no Namecheap.`,
                  namecheapResponse
                );
              } else {
                yield* sendSSE(
                  "ERROR",
                  `Namecheap API reportou falha ao configurar DNS para ${domainName}.`,
                  namecheapResponse
                );
              }
            } catch (error) {
              console.error(
                `Erro ao enviar registros DNS para Namecheap para ${domainName}:`,
                error
              );
              let errorDetails: unknown = {};
              let status = 500;
              if (error instanceof Error && error.message.match(/^\d+$/)) {
                // Check if error.message is a Namecheap error code
                errorDetails = {
                  namecheapErrorCode: error.message,
                  message: "Erro da API Namecheap.",
                };
                status = 400; // Bad request due to API constraints typically
              } else if (axios.isAxiosError(error)) {
                errorDetails = error.response?.data || {};
                status = error.response?.status || 500;
              } else if (error instanceof Error) {
                errorDetails = { message: error.message };
              }
              yield* sendSSE(
                "ERROR",
                `Falha crítica ao enviar registros para Namecheap (HTTP ${status}).`,
                errorDetails
              );
            }
          } else if (pleskDnsRecords.length > 0) {
            yield* sendSSE(
              "INFO",
              "Nenhum registro DNS do Plesk era compatível para sincronização com Namecheap após a transformação."
            );
          }
        } else {
          yield* sendSSE(
            "INFO",
            "Nenhum registro DNS encontrado no Plesk, etapa de sincronização com Namecheap ignorada."
          );
        }
        // ----- END: Full DNS Synchronization with Namecheap -----

        yield* sendSSE(
          "INFO",
          "Instalando plugins adicionais (Elementor Pro)..."
        );
        await pleskApi.wordpress.addPluginToWebsite(
          +stdOut["instance-id"],
          ELEMENTOR_PRO_PLUGIN_ID
        );
        yield* sendSSE(
          "INFO",
          "Plugin Elementor Pro agendado para instalação/ativação."
        );

        const userLogger = new AppLogger(user);
        userLogger.log({
          title: "Instalação do WordPress",
          description: `Instância do WordPress criada com sucesso em ${domainName}.`,
          severity: "success",
          type: "hosting",
        });

        yield* sendSSE(
          "SUCCESS",
          "Instalação do WordPress e configuração inicial concluídas com sucesso!"
        );
      } catch (error) {
        console.error("Erro geral no processo de instalação:", error);
        let errorMsg = "Erro desconhecido durante a instalação.";
        let errorDetails = {};
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
  [key: string]: string | number | boolean | undefined | object;
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
        stdout: response.stdout, // Keep raw stdout as well
      };
      // Try to get specific fields if they exist
      if (jsonOutput.result && typeof jsonOutput.result === "object") {
        parsedOutput.admin_url =
          jsonOutput.result.admin_url || parsedOutput.admin_url;
        parsedOutput.site_url =
          jsonOutput.result.site_url || parsedOutput.site_url;
      }
      parsedOutput.admin_url = jsonOutput.admin_url || parsedOutput.admin_url; // From top level
      parsedOutput.site_url = jsonOutput.site_url || parsedOutput.site_url; // From top level
      if (typeof jsonOutput.exit_code === "number") {
        // CLI might put exit_code in JSON
        parsedOutput.exit_code = jsonOutput.exit_code;
      }
    } else {
      parsedOutput.stdout = "";
    }
  } catch (e) {
    // console.warn("Failed to parse Plesk CLI stdout as JSON:", response.stdout);
    parsedOutput.stdout = response.stdout || ""; // Store non-JSON stdout
    if (!parsedOutput.message && !parsedOutput.error && response.stderr) {
      parsedOutput.error = response.stderr;
    } else if (!parsedOutput.message && !parsedOutput.error) {
      // parsedOutput.error = `Invalid or non-JSON response from server: ${response.stdout}`;
    }
  }
  return parsedOutput;
}
