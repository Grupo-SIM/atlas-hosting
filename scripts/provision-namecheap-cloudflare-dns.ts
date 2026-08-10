import "dotenv/config";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pgOrganizationDomains } from "@/lib/db/schema";
import { provisionNamecheapCloudflareDomains } from "@/lib/server/domains/provision-namecheap-cloudflare-dns";

interface CliOptions {
  apply: boolean;
  domain?: string;
  scanWaitSeconds: number;
}

function optionValue(args: string[], name: string) {
  const inline = args.find(argument => argument.startsWith(`${name}=`));
  if (inline) {
    const value = inline.slice(name.length + 1);
    if (!value) throw new Error(`${name} requer um valor.`);
    return value;
  }
  const index = args.indexOf(name);
  if (index < 0) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith("--"))
    throw new Error(`${name} requer um valor.`);
  return value;
}

function parseOptions(args: string[]): CliOptions {
  const domain = optionValue(args, "--domain")?.trim().toLowerCase();
  const waitValue = optionValue(args, "--scan-wait-seconds") ?? "60";
  const scanWaitSeconds = Number(waitValue);
  if (!Number.isInteger(scanWaitSeconds) || scanWaitSeconds < 0)
    throw new Error(
      "--scan-wait-seconds deve ser um inteiro maior ou igual a zero."
    );
  return {
    apply: args.includes("--apply"),
    domain: domain || undefined,
    scanWaitSeconds,
  };
}

async function main() {
  const options = parseOptions(process.argv.slice(2));
  const filters = [
    eq(pgOrganizationDomains.active, true),
    eq(pgOrganizationDomains.registrarProvider, "namecheap"),
    eq(pgOrganizationDomains.dnsMode, "cloudflare"),
  ];
  if (options.domain)
    filters.push(eq(pgOrganizationDomains.domain, options.domain));

  const candidates = await db
    .select({
      cloudflareZoneId: pgOrganizationDomains.cloudflareZoneId,
      cloudflareZoneStatus: pgOrganizationDomains.cloudflareZoneStatus,
      connectionStatus: pgOrganizationDomains.connectionStatus,
      dnsImportStatus: pgOrganizationDomains.dnsImportStatus,
      domain: pgOrganizationDomains.domain,
      expectedNameservers: pgOrganizationDomains.expectedNameservers,
      id: pgOrganizationDomains.id,
      lastDnsError: pgOrganizationDomains.lastDnsError,
    })
    .from(pgOrganizationDomains)
    .where(and(...filters));

  console.log(
    JSON.stringify(
      {
        apply: options.apply,
        candidates: candidates.map(candidate => ({
          cloudflareZoneId: candidate.cloudflareZoneId,
          cloudflareZoneStatus: candidate.cloudflareZoneStatus,
          connectionStatus: candidate.connectionStatus,
          dnsImportStatus: candidate.dnsImportStatus,
          domain: candidate.domain,
          expectedNameservers: candidate.expectedNameservers,
          lastDnsError: candidate.lastDnsError,
        })),
        scanWaitSeconds: options.scanWaitSeconds,
        total: candidates.length,
      },
      null,
      2
    )
  );
  if (!options.apply || candidates.length === 0) return;

  const results = await provisionNamecheapCloudflareDomains(
    candidates,
    options.scanWaitSeconds * 1000
  );
  for (const result of results)
    console.log(
      `[${result.status.toUpperCase()}] ${result.domain}: ${result.message}`
    );

  const failed = results.filter(result => result.status === "error").length;
  console.log(
    JSON.stringify(
      { failed, succeeded: results.length - failed, total: results.length },
      null,
      2
    )
  );
  if (failed > 0) process.exitCode = 1;
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
