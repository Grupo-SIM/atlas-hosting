import dns from "node:dns";
import { promisify } from "node:util";
import { getUser } from "@/lib/auth";

const resolve4 = promisify(dns.resolve4);

async function checkDomain(domain: string): Promise<boolean> {
  try {
    const addresses = await resolve4(domain);
    return addresses.includes(process.env.SERVER_IP!);
  } catch (error) {
    return false;
  }
}

export async function GET(request: Request) {
  const user = await getUser();

  if (!user) {
    return Response.error();
  }

  const domainsParam = new URL(request.url).searchParams.get("domains");

  if (!domainsParam) {
    return Response.error();
  }

  const domains = domainsParam
    .split(",")
    .map(domain => new URL(domain).hostname);

  // Initial DNS check for all domains
  const initialResults = await Promise.all(
    domains.map(async domain => ({
      domain,
      ready: await checkDomain(domain),
    }))
  );

  // Filter out ready domains
  const pendingDomains = initialResults
    .filter(result => !result.ready)
    .map(result => result.domain);

  // If all domains are ready, return immediately
  if (pendingDomains.length === 0) {
    return new Response(
      JSON.stringify({
        domains: {},
        initial: Object.fromEntries(domains.map(domain => [domain, true])),
        updates: [],
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const response = new Response(
    // @ts-expect-error Bun async generators are not typed
    (async function* () {
      const results = new Map(domains.map(domain => [domain, false]));
      // Set initial results

      for (const { domain, ready } of initialResults) {
        results.set(domain, ready);
      }

      let allReady = false;

      while (!allReady) {
        const checks = pendingDomains.map(async domain => {
          const ready = await checkDomain(domain);
          results.set(domain, ready);
          return { domain, ready };
        });

        const domainResults = await Promise.all(checks);

        // Send current state for all domains
        yield `data: ${JSON.stringify({
          domains: Object.fromEntries(
            domains.map(domain => [domain, results.get(domain)])
          ),
          initial: {},
          updates: domainResults,
        })}\n\n`;

        // Check if all domains are ready
        allReady = Array.from(results.values()).every(ready => ready);

        if (!allReady) {
          // Wait for 10 seconds before next check
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
      }
    })(),
    {
      headers: {
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Content-Encoding": "none",
        "Content-Type": "text/event-stream; charset=utf-8",
      },
    }
  );

  return response;
}
