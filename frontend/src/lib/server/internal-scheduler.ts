import { Client } from "pg";

interface ScheduledJob {
  name: string;
  run: () => Promise<void>;
}

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const THIRTY_SECONDS = 30 * 1000;

declare global {
  var atlasInternalSchedulerStarted: boolean | undefined;
}

function getAuthorizationToken() {
  return (
    process.env.CRON_SECRET ||
    process.env.API_MACHINE_INTERNAL_TOKEN ||
    process.env.INTERNAL_SERVICE_TOKEN
  );
}

function internalRequest(path: string) {
  const token = getAuthorizationToken();
  if (!token) throw new Error("CRON_SECRET não está configurado.");
  return new Request(`http://atlas.internal${path}`, {
    headers: { authorization: `Bearer ${token}` },
  });
}

async function invokeInternalGet(path: string): Promise<void> {
  const request = internalRequest(path);
  const handler = await (async () => {
    switch (path.split("?")[0]) {
      case "/api/internal/vps-subscriptions/renew":
        return (
          await import("@/app/api/internal/vps-subscriptions/renew/route")
        ).GET;
      case "/api/internal/site-hosting/renew":
        return (await import("@/app/api/internal/site-hosting/renew/route"))
          .GET;
      case "/api/internal/expiry-notifications":
        return (await import("@/app/api/internal/expiry-notifications/route"))
          .GET;
      case "/api/internal/domain-payments/reconcile":
        return (
          await import("@/app/api/internal/domain-payments/reconcile/route")
        ).GET;
      case "/api/internal/namecheap-verification":
        return (await import("@/app/api/internal/namecheap-verification/route"))
          .GET;
      case "/api/internal/domains/reconcile-cloudflare-activation":
        return (
          await import(
            "@/app/api/internal/domains/reconcile-cloudflare-activation/route"
          )
        ).GET;
      default:
        throw new Error(`Endpoint interno desconhecido: ${path}`);
    }
  })();
  const response = await handler(request);
  if (response.ok) return;
  throw new Error(
    `${path} respondeu HTTP ${response.status}: ${await response.text()}`
  );
}

async function withPostgresLock(
  name: string,
  run: () => Promise<void>
): Promise<void> {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error(`[SCHEDULER] ${name}: banco não configurado.`);
    return;
  }

  const client = new Client({ connectionString });
  try {
    await client.connect();
    const result = await client.query<{ acquired: boolean }>(
      "SELECT pg_try_advisory_lock(hashtext($1)) AS acquired",
      [`atlas-scheduler:${name}`]
    );
    if (!result.rows[0]?.acquired) {
      console.info(`[SCHEDULER] ${name}: outra réplica já está executando.`);
      return;
    }
    await run();
    console.info(`[SCHEDULER] ${name}: concluído.`);
  } finally {
    await client
      .end()
      .catch(error =>
        console.error(`[SCHEDULER] ${name}: falha ao encerrar lock:`, error)
      );
  }
}

function runJob(job: ScheduledJob) {
  void withPostgresLock(job.name, job.run).catch(error =>
    console.error(`[SCHEDULER] ${job.name}: falhou.`, error)
  );
}

export function millisecondsUntilUtcHour(now: Date, hour: number) {
  const target = new Date(now);
  target.setUTCHours(hour, 0, 0, 0);
  if (target.getTime() <= now.getTime())
    target.setUTCDate(target.getUTCDate() + 1);
  return target.getTime() - now.getTime();
}

function scheduleEvery(job: ScheduledJob, milliseconds: number) {
  runJob(job);
  setInterval(() => runJob(job), milliseconds);
}

function scheduleDailyAtUtcHour(job: ScheduledJob, hour: number) {
  const scheduleNext = () => {
    setTimeout(
      () => {
        runJob(job);
        scheduleNext();
      },
      millisecondsUntilUtcHour(new Date(), hour)
    );
  };
  scheduleNext();
}

export function startInternalScheduler() {
  if (process.env.NODE_ENV !== "production") return;
  if (globalThis.atlasInternalSchedulerStarted) return;
  globalThis.atlasInternalSchedulerStarted = true;

  const vpsRenewal: ScheduledJob = {
    name: "vps-renewal",
    run: () => invokeInternalGet("/api/internal/vps-subscriptions/renew"),
  };
  const siteHostingRenewal: ScheduledJob = {
    name: "site-hosting-renewal",
    run: () => invokeInternalGet("/api/internal/site-hosting/renew"),
  };
  const expiryNotifications: ScheduledJob = {
    name: "expiry-notifications",
    run: () => invokeInternalGet("/api/internal/expiry-notifications"),
  };
  const subscriptionReminders: ScheduledJob = {
    name: "vps-expiry-notifications",
    run: () =>
      invokeInternalGet(
        "/api/internal/expiry-notifications?subscriptionsOnly=true"
      ),
  };
  const pixReconciliation: ScheduledJob = {
    name: "pix-reconciliation",
    async run() {
      const results = await Promise.allSettled([
        invokeInternalGet("/api/internal/domain-payments/reconcile"),
        invokeInternalGet("/api/internal/namecheap-verification"),
      ]);
      const rejected = results.find(
        (result): result is PromiseRejectedResult =>
          result.status === "rejected"
      );
      if (rejected) throw rejected.reason;
    },
  };
  const cloudflareActivation: ScheduledJob = {
    name: "cloudflare-activation",
    run: () =>
      invokeInternalGet(
        "/api/internal/domains/reconcile-cloudflare-activation"
      ),
  };

  scheduleEvery(pixReconciliation, THIRTY_SECONDS);
  scheduleEvery(cloudflareActivation, FIFTEEN_MINUTES);
  scheduleEvery(vpsRenewal, FIFTEEN_MINUTES);
  scheduleEvery(subscriptionReminders, FIFTEEN_MINUTES);
  scheduleEvery(siteHostingRenewal, FIFTEEN_MINUTES);
  // Checkpoints VPS persistidos; domínios mantêm execução diária.
  scheduleDailyAtUtcHour(expiryNotifications, 12);
  console.info("[SCHEDULER] Agendadores internos iniciados.");
}
