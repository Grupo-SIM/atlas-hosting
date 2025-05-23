// src/app/api/wp-install/route.ts
import { getUser } from "@/lib/auth";
import { NextRequest } from "next/server";
import pleskApi from "@/lib/server/apis/plesk";
import { ClientRequestTypeEnum } from "@/plesk"; // Assuming this is from your Plesk SDK
import { db } from "@/lib/db";
import { userTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { namecheapApi } from "@/lib/server/apis/namecheap"; // Import Namecheap API
import { DnsHostRecord } from "@/lib/server/apis/namecheap/types"; // Import DnsHostRecord type

// Helper function to send SSE messages
function sendSSE(
  controller: ReadableStreamDefaultController<any>,
  type: "INFO" | "ERROR" | "SUCCESS" | "STEP",
  message: string,
  details?: any
) {
  const data = JSON.stringify({ type, message, step: message, details }); // 'step' for compatibility if frontend uses it
  controller.enqueue(`data: ${data}\n\n`);
}

export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(request.url);
  const domainName = url.searchParams.get("domain");
  const adminUsername = url.searchParams.get("admin_username");
  const adminPassword = url.searchParams.get("admin_password");
  const siteName = url.searchParams.get("site_name");

  if (!domainName || !adminUsername || !adminPassword || !siteName) {
    return new Response(
      JSON.stringify({ error: "Missing required parameters" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const send = (
        type: "INFO" | "ERROR" | "SUCCESS" | "STEP",
        message: string,
        details?: any
      ) => sendSSE(controller, type, message, details);

      try {
        send("INFO", "Iniciando instalação do WordPress...");

        // 1. Ensure Plesk client exists or create one
        let pleskId = user.pleskId;

        if (!pleskId) {
          send("INFO", "Configurando usuário no painel de hospedagem...");
          const pleskClient = await pleskApi.createClient({
            name: user.name || user.email, // Ensure name is available
            email: user.email,
            login: user.email, // Plesk login
            password: user.password, // This should be a secure, perhaps temporary or generated password
            type: ClientRequestTypeEnum.Customer,
            externalId: user.id,
            ownerLogin: process.env.PLESK_ADMIN_USERNAME || "admin", // Ensure admin login is configured
            status: 0, // Active
          });

          if (pleskClient && pleskClient.id) {
            await db
              .update(userTable)
              .set({ pleskId: pleskClient.id })
              .where(eq(userTable.id, user.id));
            pleskId = pleskClient.id;
          } else {
            send("ERROR", "Falha ao criar usuário no Plesk.", pleskClient);
            controller.close();
            return;
          }
        }

        // 2. Create/Assign domain in Plesk
        send("INFO", `Configurando domínio ${domainName} no sistema...`);
        try {
          const domainData = await pleskApi.getDomain(domainName);

          if (domainData) {
            await pleskApi.deleteDomain(domainData.id);
          }

          await pleskApi.assignDomain(domainName, +pleskId!); // Assign to the client's Plesk account
          send("INFO", `Domínio ${domainName} configurado no Plesk.`);
        } catch (e: any) {
          // Check if error is because domain already exists for this client
          if (
            e.response &&
            e.response.data &&
            e.response.data.message &&
            e.response.data.message.includes("already exists")
          ) {
            send(
              "INFO",
              `Domínio ${domainName} já existe no sistema para este usuário.`
            );
          } else {
            send(
              "ERROR",
              `Erro ao configurar domínio ${domainName} no Plesk.`,
              e.message || e
            );
            controller.close();
            return;
          }
        }

        // 3. Set DNS records using Namecheap API
        send(
          "INFO",
          `Configurando registros DNS para ${domainName} via Namecheap...`
        );
        // IMPORTANT: The `domainName` here MUST be the apex domain registered with Namecheap (e.g., example.com, example.co.uk)
        // It should not be a subdomain like 'www.example.com' for SLD/TLD parsing.

        let sld: string;
        let tld: string;
        const domainParts = domainName.split(".");

        // This logic attempts to correctly identify SLD and TLD for Namecheap
        // Assumes domainName is the registrable domain (e.g., 'mydomain.com' or 'mydomain.co.uk')
        if (domainParts.length < 2) {
          send(
            "ERROR",
            `Formato de domínio inválido para configuração de DNS: ${domainName}`
          );
          controller.close();
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
          send(
            "ERROR",
            `Não foi possível determinar o SLD para o domínio: ${domainName}`
          );
          controller.close();
          return;
        }

        const serverIp = process.env.SERVER_IP;
        if (!serverIp) {
          send(
            "ERROR",
            "IP do servidor não configurado nas variáveis de ambiente (SERVER_IP)."
          );
          controller.close();
          return;
        }

        const dnsRecords: DnsHostRecord[] = [
          { HostName: "@", RecordType: "A", Address: serverIp, TTL: 1800 },
          { HostName: "www", RecordType: "A", Address: serverIp, TTL: 1800 },
        ];

        // Reminder: namecheap.domains.dns.setHosts overwrites ALL existing records.
        // If you need to preserve MX, TXT, etc., you must first fetch existing records
        // (implement getHosts in NamecheapApiWrapper) and include them in this list.
        send(
          "INFO",
          "Atenção: A configuração de DNS substituirá todos os registros existentes para o domínio com os novos registros A."
        );

        try {
          const dnsResult = await namecheapApi.setHosts({
            SLD: sld,
            TLD: tld,
            Records: dnsRecords,
          });

          if (dnsResult.IsSuccess) {
            send(
              "INFO",
              `Registros DNS para ${domainName} configurados com sucesso via Namecheap.`
            );
          } else {
            // Even if IsSuccess is false, Namecheap API might not throw an error but return it in the response.
            // The _makeRequest should throw for Status="ERROR" in ApiResponse.
            // This path might be if ApiResponse Status="OK" but CommandResponse indicates logical failure.
            send(
              "ERROR",
              `Falha ao configurar registros DNS para ${domainName} via Namecheap.`,
              dnsResult
            );
            controller.close();
            return;
          }
        } catch (dnsError: any) {
          send(
            "ERROR",
            `Erro ao configurar DNS via Namecheap: ${dnsError.message || "Erro desconhecido"}`,
            dnsError
          );
          controller.close();
          return;
        }

        // 4. Install WordPress using Plesk WP Toolkit CLI
        send(
          "INFO",
          `Instalando WordPress em ${domainName}... Isso pode levar alguns minutos.`
        );
        // Construct the WP Toolkit command arguments
        const wpInstallArgs = [
          "--path=/", // Install in the webroot of the domain
          `--title="${siteName}"`,
          `--admin-user="${adminUsername}"`,
          `--admin-password="${adminPassword}"`, // Consider password strength policies
          `--admin-email="${user.email}"`,
          // Add other options as needed, e.g., language, version
          // `--locale=pt_BR`,
        ];

        const wpInstallRawResult = await pleskApi.wordpress.installWp(
          domainName,
          adminUsername,
          adminPassword,
          siteName,
          user.email
        );

        if (wpInstallRawResult.code === 0 && wpInstallRawResult.stdout) {
          // WP Toolkit success typically code 0
          let siteUrl = "";
          let adminUrl = "";
          try {
            // Try to parse stdout if it's JSON, otherwise look for known strings
            const outputJson = JSON.parse(wpInstallRawResult.stdout);
            siteUrl =
              outputJson.site_url ||
              outputJson.siteUrl ||
              `http://${domainName}`;
            adminUrl =
              outputJson.admin_url ||
              outputJson.adminUrl ||
              `http://${domainName}/wp-admin`;
          } catch (parseError) {
            // Fallback if stdout is not JSON - this can happen with WP Toolkit CLI output
            const stdoutText = wpInstallRawResult.stdout.toLowerCase();
            const siteUrlMatch = stdoutText.match(
              /site url:\s*(https?:\/\/[^\s]+)/
            );
            const adminUrlMatch = stdoutText.match(
              /admin url:\s*(https?:\/\/[^\s]+)/
            );
            siteUrl = siteUrlMatch ? siteUrlMatch[1] : `http://${domainName}`;
            adminUrl = adminUrlMatch
              ? adminUrlMatch[1]
              : `http://${domainName}/wp-admin`;
          }

          send("SUCCESS", "WordPress instalado com sucesso!", {
            siteUrl,
            adminUrl,
            message: `WordPress instalado! Site: ${siteUrl}, Admin: ${adminUrl}`,
          });
        } else {
          send("ERROR", "Falha na instalação do WordPress via WP Toolkit.", {
            stdout: wpInstallRawResult.stdout,
            stderr: wpInstallRawResult.stderr,
            code: wpInstallRawResult.code,
            message:
              wpInstallRawResult.stderr ||
              wpInstallRawResult.stdout ||
              "Erro desconhecido do WP Toolkit.",
          });
        }
      } catch (error: any) {
        console.error("WP Install Route Error:", error);
        send(
          "ERROR",
          `Erro geral no processo de instalação: ${error.message || "Erro desconhecido."}`,
          error
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
