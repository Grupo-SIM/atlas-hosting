import { exec } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { type NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import pleskApi from "@/lib/server/apis/plesk";
import * as Plesk from "@/plesk";

const execAsync = promisify(exec);

interface ExtractedWordPressData {
  files: string;
  database: string;
  wpConfig: {
    dbName: string;
    dbUser: string;
    dbPassword: string;
    dbHost: string;
    tablePrefix: string;
    siteUrl: string;
    homeUrl: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { message: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const domain = formData.get("domain") as string;
    const userEmail = formData.get("userEmail") as string;

    if (!file || !domain) {
      return NextResponse.json(
        { message: "Arquivo e domínio são obrigatórios" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".zip")) {
      return NextResponse.json(
        { message: "Apenas arquivos ZIP são permitidos" },
        { status: 400 }
      );
    }

    // Create temporary directory for processing
    const tempDir = path.join(process.cwd(), "temp", `transfer_${Date.now()}`);
    await mkdir(tempDir, { recursive: true });

    const zipPath = path.join(tempDir, file.name);
    const extractDir = path.join(tempDir, "extracted");

    try {
      // Save uploaded file
      const bytes = await file.arrayBuffer();
      await writeFile(zipPath, Buffer.from(bytes));

      // Extract ZIP file
      await mkdir(extractDir, { recursive: true });
      await execAsync(`unzip -q "${zipPath}" -d "${extractDir}"`);

      // Parse WordPress data from extracted files
      const wpData = await parseWordPressExport(extractDir);

      // Ensure user has Plesk account
      await ensurePleskAccount(user);

      // Create subscription/domain in Plesk
      const subscription = await createPleskSubscription(domain, user);

      // Create WordPress installation
      const wpInstance = await installWordPressOnPlesk(domain, wpData, user);

      // Import files and database
      await importWordPressData(wpInstance.instanceId, wpData, extractDir);

      // Configure WordPress settings
      await configureWordPressSettings(wpInstance.instanceId, domain, wpData);

      // Cleanup temporary files
      await cleanupTempFiles(tempDir);

      const siteUrl = `https://${domain}`;
      const adminUrl = `${siteUrl}/wp-admin`;

      return NextResponse.json({
        adminUrl,
        instanceId: wpInstance.instanceId,
        message: "Site WordPress transferido com sucesso",
        siteUrl,
      });
    } catch (error) {
      // Cleanup on error
      await cleanupTempFiles(tempDir).catch(() => {});
      throw error;
    }
  } catch (error) {
    console.error("Erro na transferência do WordPress:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Erro interno do servidor";

    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

async function parseWordPressExport(
  extractDir: string
): Promise<ExtractedWordPressData> {
  const configPath = path.join(extractDir, "wp-config.php");
  const dbPath = path.join(extractDir, "database.csv");
  const filesPath = path.join(extractDir, "files");

  // Read wp-config.php to extract database settings
  const { stdout: configContent } = await execAsync(`cat "${configPath}"`);

  // Parse database configuration from wp-config.php
  const dbName = extractConfigValue(configContent, "DB_NAME");
  const dbUser = extractConfigValue(configContent, "DB_USER");
  const dbPassword = extractConfigValue(configContent, "DB_PASSWORD");
  const dbHost = extractConfigValue(configContent, "DB_HOST") || "localhost";
  const tablePrefix =
    extractConfigValue(configContent, "table_prefix") || "wp_";

  // Extract site URLs from database CSV
  const { stdout: dbContent } = await execAsync(`head -100 "${dbPath}"`);
  const siteUrl = extractSiteUrlFromDb(dbContent);
  const homeUrl = extractHomeUrlFromDb(dbContent) || siteUrl;

  return {
    database: dbPath,
    files: filesPath,
    wpConfig: {
      dbHost,
      dbName,
      dbPassword,
      dbUser,
      homeUrl,
      siteUrl,
      tablePrefix,
    },
  };
}

function extractConfigValue(configContent: string, key: string): string {
  const regex = new RegExp(
    `define\\s*\\(\\s*['"]${key}['"]\\s*,\\s*['"]([^'"]+)['"]`,
    "i"
  );
  const match = configContent.match(regex);
  return match ? match[1] : "";
}

function extractSiteUrlFromDb(dbContent: string): string {
  // Look for siteurl option in the database dump
  const lines = dbContent.split("\n");
  for (const line of lines) {
    if (line.includes("siteurl") && line.includes("http")) {
      const urlMatch = line.match(/https?:\/\/[^,'"]+/);
      if (urlMatch) return urlMatch[0];
    }
  }
  return "";
}

function extractHomeUrlFromDb(dbContent: string): string | null {
  // Look for home option in the database dump
  const lines = dbContent.split("\n");
  for (const line of lines) {
    if (
      line.includes("home") &&
      line.includes("http") &&
      !line.includes("siteurl")
    ) {
      const urlMatch = line.match(/https?:\/\/[^,'"]+/);
      if (urlMatch) return urlMatch[0];
    }
  }
  return null;
}

async function ensurePleskAccount(user: any) {
  // Create Plesk customer account if needed
  try {
    const pleskClient = await pleskApi.createClient({
      email: user.email,
      externalId: user.id,
      login: user.email,
      name: user.name,
      password: generateRandomPassword(),
      type: Plesk.ClientRequestTypeEnum.Customer,
    });

    return pleskClient;
  } catch (error) {
    // Client might already exist, continue
    console.log("Cliente Plesk já existe ou erro na criação:", error);
    return null;
  }
}

async function createPleskSubscription(domain: string, user: any) {
  // Create subscription using the existing API
  try {
    const subscription = await pleskApi.subscriptions.createSubscription({
      domainName: domain,
      login: user.email,
      ownerLogin: user.email,
      password: generateRandomPassword(),
    });

    return subscription;
  } catch (error) {
    console.error("Erro ao criar subscription:", error);
    throw new Error("Falha ao criar subscription no Plesk");
  }
}

async function installWordPressOnPlesk(
  domain: string,
  wpData: ExtractedWordPressData,
  user: any
) {
  // Install WordPress using Plesk WP Toolkit
  try {
    const adminPassword = generateRandomPassword();
    const installResult = await pleskApi.wordpress.installWp(
      domain,
      "admin",
      adminPassword,
      "Site WordPress Transferido",
      user.email
    );

    if (!installResult?.stdout) {
      throw new Error("Falha na instalação do WordPress");
    }

    const stdOut = JSON.parse(installResult.stdout || "{}");

    if (!stdOut["instance-id"]) {
      throw new Error("ID da instância WordPress não encontrado");
    }

    return {
      adminPassword,
      instanceId: stdOut["instance-id"],
    };
  } catch (error) {
    console.error("Erro ao instalar WordPress:", error);
    throw new Error("Falha na instalação do WordPress no Plesk");
  }
}

async function importWordPressData(
  instanceId: number,
  wpData: ExtractedWordPressData,
  extractDir: string
) {
  try {
    // Import database
    await pleskApi.wordpress.callWp(
      `--wp-cli -instance-id ${instanceId} -- db import "${wpData.database}"`
    );

    // Get WordPress installation path
    const wpPath = await getWordPressPath(instanceId);

    // Sync files (copy WordPress files to the installation directory)
    await execAsync(`rsync -av "${wpData.files}/" "${wpPath}/"`);

    // Set proper permissions
    await execAsync(`chown -R www-data:www-data "${wpPath}"`);
    await execAsync(`chmod -R 755 "${wpPath}"`);
  } catch (error) {
    console.error("Erro ao importar dados do WordPress:", error);
    throw new Error("Falha na importação dos dados");
  }
}

async function configureWordPressSettings(
  instanceId: number,
  domain: string,
  wpData: ExtractedWordPressData
) {
  try {
    const newSiteUrl = `https://${domain}`;

    // Update site URLs in the database
    await pleskApi.wordpress.callWp(
      `--wp-cli -instance-id ${instanceId} -- option update siteurl "${newSiteUrl}"`
    );

    await pleskApi.wordpress.callWp(
      `--wp-cli -instance-id ${instanceId} -- option update home "${newSiteUrl}"`
    );

    // Update any hardcoded URLs in the database
    if (wpData.wpConfig.siteUrl && wpData.wpConfig.siteUrl !== newSiteUrl) {
      await pleskApi.wordpress.callWp(
        `--wp-cli -instance-id ${instanceId} -- search-replace "${wpData.wpConfig.siteUrl}" "${newSiteUrl}"`
      );
    }

    // Flush rewrite rules
    await pleskApi.wordpress.callWp(
      `--wp-cli -instance-id ${instanceId} -- rewrite flush`
    );

    // Update permalink structure
    await pleskApi.wordpress.callWp(
      `--wp-cli -instance-id ${instanceId} -- rewrite structure '/%postname%/'`
    );
  } catch (error) {
    console.error("Erro ao configurar WordPress:", error);
    throw new Error("Falha na configuração do WordPress");
  }
}

async function getWordPressPath(instanceId: number): Promise<string> {
  try {
    const result = await pleskApi.wordpress.callWp(
      `--wp-cli -instance-id ${instanceId} -- eval "echo ABSPATH;"`
    );

    return result.stdout.trim();
  } catch (error) {
    console.error("Erro ao obter caminho do WordPress:", error);
    throw new Error("Falha ao obter caminho da instalação");
  }
}

async function cleanupTempFiles(tempDir: string) {
  try {
    await execAsync(`rm -rf "${tempDir}"`);
  } catch (error) {
    console.error("Erro ao limpar arquivos temporários:", error);
  }
}

function generateRandomPassword(length = 16): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}
