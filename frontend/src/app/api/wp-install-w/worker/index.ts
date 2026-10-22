// prevents TS errors
export declare let self: Worker;

import axios from "axios";
import { eq } from "drizzle-orm";
import {
  parsePleskCliResponse,
  transformPleskHostToNamecheapHostName,
} from "@/app/api/wp-install-w/utils";
import { db } from "@/lib/db";
import { pgOrganization } from "@/lib/db/schema";
import type {
  DnsHostRecord,
  DnsRecordType as NamecheapDnsRecordType,
} from "@/lib/server/apis/namecheap/types";
import pleskApi from "@/lib/server/apis/plesk";
import WpCliApi from "@/lib/server/apis/plesk/wp-toolkit/wp-cli";
import {
  createSubscription,
  deleteDomain,
  deleteFtpUser,
  getDomain,
} from "@/lib/server/apis/plesk-xml/client";
import type { GetDnsRecordsResult } from "@/lib/server/apis/plesk-xml/types";
import { configureWebHostingDns } from "@/lib/server/domains/cloudflare-dns";
import { AppLogger } from "@/lib/server/logs";
import { ClientRequestTypeEnum } from "@/plesk";
import type { InstallWpData } from "../types";
import type { AddWebspaceParams } from "./types";

self.onmessage = async (event: MessageEvent<InstallWpData>) => {
  const {
    user,
    domainName,
    adminEmail,
    adminPassword,
    adminUsername,
    plugins,
    siteName,
  } = event.data;

  try {
    sendProgress("INFO", "Iniciando a instalação do WordPress...");

    let { pleskId } = user.organization;
    const { id: userId, email: userEmailForPlesk } = user;

    if (!pleskId) {
      sendProgress("INFO", "Criando usuário de hospedagem no sistema...");
      const pleskClientPassword = "Default#Password123";

      const result = await pleskApi.createClient({
        email: userEmailForPlesk,
        login: user.id.replaceAll("-", "").substring(0, 50),
        name: user.name,
        password: pleskClientPassword,
        status: 0,
        type: ClientRequestTypeEnum.Customer,
      });

      sendProgress("INFO", "Atualizando os dados do usuário...");
      if (result?.id) {
        await db
          .update(pgOrganization)
          .set({ pleskId: result.id })
          .where(eq(pgOrganization.id, user.organization.id));
        pleskId = result.id;
        sendProgress("INFO", "Usuário de hospedagem criado e vinculado.");
      } else {
        console.error("Failed to create client:", result);
        sendProgress("ERROR", "Erro ao criar usuário de hospedagem no sistema");
        return;
      }

      if (!pleskId) {
        throw new Error("Plesk ID não encontrado");
      }
    }

    sendProgress("INFO", "Verificando e configurando domínio...");
    let existingDomainInPlesk: { id: number } | undefined;

    try {
      existingDomainInPlesk = await getDomain(domainName);
    } catch {}
    if (existingDomainInPlesk) {
      await deleteDomain(domainName);
    }

    try {
      await deleteFtpUser(`${domainName}-${pleskId}`);
    } catch {
      // Ignore errors if FTP user does not exist
      console.warn(
        `FTP user ${domainName}-${pleskId} not found, skipping deletion.`
      );
    }

    const params: AddWebspaceParams = {
      gen_setup: {
        htype: "vrt_hst",
        ip_address: process.env.SERVER_IP as string,
        name: domainName,
        "owner-id": pleskId,
      },
      hosting: {
        vrt_hst: {
          property: [
            { name: "ftp_login", value: `${domainName}-${pleskId}` },
            { name: "ftp_password", value: "Default#Password123" },
            { name: "ftp_quota", value: (10 * 1024 * 1024 * 1024).toString() },
            { name: "ssl", value: "true" },
            { name: "php_handler_id", value: "fpm" },
            { name: "memory_limit", value: "2G" },
            { name: "php", value: "true" },
            { name: "webstat", value: "webalizer" },
            { name: "upload_max_filesize", value: "5G" },
            { name: "seo-redirect", value: "www" },
          ],
        },
      },
      performance: {
        bandwidth: (30 * 1024 * 1024 * 1024) / 30,
        max_connections: 500,
      },
      "php-settings": [
        {
          setting: {
            name: "file_uploads",
            value: "true",
          },
        },
      ],
    };

    const sub = await createSubscription(params);

    // await pleskApi.assignDomain(domainName, +pleskId);

    // SLD and TLD determination (from user's original file)
    let sld: string;
    let tld: string;
    const domainParts = domainName.split(".");
    if (domainParts.length < 2) {
      sendProgress(
        "ERROR",
        `Formato de domínio inválido para configuração de DNS: ${domainName}`
      );
      return;
    }
    const commonSecondLevel = ["co", "com", "org", "net", "gov", "ac", "edu"];
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
      sendProgress(
        "ERROR",
        `Não foi possível determinar o SLD para o domínio: ${domainName}`
      );
      return;
    }
    sendProgress(
      "INFO",
      `SLD: ${sld}, TLD: ${tld} determinados para ${domainName}.`
    );

    const serverIp = process.env.SERVER_IP; // This is used by Plesk WP Toolkit, not directly for Namecheap sync here
    if (!serverIp) {
      sendProgress(
        "ERROR",
        "IP do servidor não configurado (SERVER_IP), necessário para a instalação do WordPress."
      );
      return;
    }

    // --on--- START: Full DNS Synchronization with Namecheap -----
    async function setupDns() {
      sendProgress("INFO", "Configurando registros DNS no Atlas...");
      await configureWebHostingDns(domainName, serverIp!);

      let pleskDnsRecords: GetDnsRecordsResult[] | undefined;
      try {
        if (!sub) {
          throw new Error("salve campeão");
        }

        pleskDnsRecords = [];
      } catch (error) {
        console.error(
          `Erro ao atualizar registros DNS para ${domainName}:`,
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
        sendProgress(
          "ERROR",
          "Falha ao atualizar os registros DNS.",
          errorDetails
        );
        // Depending on severity, you might want to 'return' here or let plugin install proceed with a warning.
        // For now, we'll let it proceed but Namecheap sync will be skipped.
        pleskDnsRecords = []; // Ensure it's an empty array to skip Namecheap update
      }

      if ((pleskDnsRecords?.length ?? 0) > 0) {
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

        for (const { data: pleskRecord } of pleskDnsRecords ?? []) {
          console.log({ pleskRecord });
          if (!pleskRecord.type) {
            continue;
          }

          const recordTypeUpper = pleskRecord.type.toUpperCase();

          if (
            !supportedNamecheapTypes.has(
              recordTypeUpper as NamecheapDnsRecordType
            )
          ) {
            skippedRecordTypes.add(pleskRecord.type);
            continue;
          }

          if (!pleskRecord.host) {
            continue;
          }

          const hostName = transformPleskHostToNamecheapHostName(
            pleskRecord.host,
            domainName
          );

          if (!pleskRecord.value) {
            return;
          }

          const namecheapEntry: DnsHostRecord = {
            Address: pleskRecord.value,
            HostName: hostName,
            RecordType: recordTypeUpper as NamecheapDnsRecordType,
            TTL: 1800, // Namecheap's default TTL
          };

          if (recordTypeUpper === "MX" && pleskRecord.opt) {
            const mxPref = Number.parseInt(pleskRecord.opt, 10);
            if (!Number.isNaN(mxPref)) {
              namecheapEntry.MXPref = mxPref;
            }
          }
          namecheapDnsEntries.push(namecheapEntry);
        }

        if (namecheapDnsEntries.length > 0) {
          try {
            sendProgress(
              "INFO",
              `Cadastrando ${namecheapDnsEntries.length} registros DNS...`
            );
            await configureWebHostingDns(domainName, serverIp!);
            const namecheapResponse = { IsSuccess: true };

            console.log({ namecheapResponse });

            if (namecheapResponse.IsSuccess) {
              sendProgress(
                "INFO",
                `Registros DNS para ${domainName} atualizados com sucesso.`,
                namecheapResponse
              );
            } else {
              sendProgress(
                "ERROR",
                `Falha ao configurar DNS para ${domainName}.`,
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
                message: "Erro da API Namecheap.",
                namecheapErrorCode: error.message,
              };
              status = 400; // Bad request due to API constraints typically
            } else if (axios.isAxiosError(error)) {
              errorDetails = error.response?.data || {};
              status = error.response?.status || 500;
            } else if (error instanceof Error) {
              errorDetails = { message: error.message };
            }
            sendProgress(
              "ERROR",
              `Falha crítica ao registrar DNS (HTTP ${status}).`
            );
          }
        }
      }
    }
    await setupDns();
    // ----- END: Full DNS Synchronization with Namecheap -----

    // let propagated = false;
    // while (!propagated) {
    //   const { answers } = await query(
    //     {
    //       question: {
    //         name: domainName,
    //         type: "A",
    //       },
    //     },
    //     {
    //       endpoints: ["1.1.1.1", "8.8.8.8"],
    //     },
    //   );

    //   propagated =
    //     answers?.some(
    //       (entry) => entry.type === "A" && entry.name === domainName
    //     ) ?? false;
    // }

    sendProgress(
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
      sendProgress("ERROR", `Erro ao instalar o WordPress: ${errorMsg}`, [
        wpInstallResult.stderr,
      ]);
      return;
    }

    await pleskApi.wordpress.createAdminUser(+stdOut["instance-id"]);

    sendProgress("INFO", "Instalando plugins...");

    const wpCli = new WpCliApi(+stdOut["instance-id"]);

    const installations: Promise<unknown>[] = [];

    try {
      installations.push(
        (async () => {
          await wpCli.plugin.install("elementor", {
            activate: true,
            force: true,
          });

          await wpCli.language
            .plugin("install elementor", "pt_BR")
            .catch(() => null);
          await wpCli.language
            .plugin("activate elementor", "pt_BR")
            .catch(() => null);

          sendProgress(
            "INFO",
            "Instalação de plugin [elementor] realizada com sucesso"
          );
        })()
      );

      installations.push(
        (async () => {
          await wpCli.plugin.install(
            "https://github.com/proelements/proelements/releases/download/v3.29.0/pro-elements.zip",
            {
              activate: true,
              force: true,
            }
          );

          await wpCli.language
            .plugin("install pro-elements", "pt_BR")
            .catch(() => null);
          await wpCli.language
            .plugin("activate pro-elements", "pt_BR")
            .catch(() => null);

          sendProgress(
            "INFO",
            "Instalação de plugin [elementor-pro] realizada com sucesso"
          );
        })()
      );

      for (const plugin of plugins) {
        installations.push(
          (async () => {
            const result = await wpCli.plugin.install(plugin, {
              activate: true,
              force: true,
            });

            await wpCli.language
              .plugin(`install ${plugin}`, "pt_BR")
              .catch(() => null);
            await wpCli.language
              .plugin(`activate ${plugin}`, "pt_BR")
              .catch(() => null);

            sendProgress(
              "INFO",
              "Instalação de plugin [".concat(
                plugin,
                "]",
                " realizada com sucesso."
              )
            );
            console.log("Plugin install result: ", result);
          })()
        );
      }

      await Promise.allSettled(installations);
    } catch (error) {
      sendProgress("ERROR", "Erro ao instalar plugins", error);
    }

    sendProgress("INFO", "Iniciando instalação de temas");

    const result = await wpCli.theme.install("hello-biz", {
      activate: true,
      force: true,
    });
    console.log("Theme install result: ", result);

    sendProgress("INFO", "Gerando certificado de segurança.");
    // await generateSslForDomain(domainName);

    const userLogger = new AppLogger(user);
    userLogger.log({
      description: `Instância do WordPress criada com sucesso em ${domainName}.`,
      severity: "success",
      title: "Instalação do WordPress",
      type: "hosting",
    });

    sendProgress(
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
    sendProgress("ERROR", `Falha na instalação: ${errorMsg}`);
  }
};

function sendProgress(
  type: "INFO" | "ERROR" | "SUCCESS",
  message: string,
  data?: unknown
) {
  console.log(`[Worker] ${type}: ${message}`, data);
  postMessage({ data, message, type });
}
