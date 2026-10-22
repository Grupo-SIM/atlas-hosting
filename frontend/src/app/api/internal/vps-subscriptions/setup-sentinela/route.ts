import { randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { NextResponse } from "next/server";

const execFileAsync = promisify(execFile);

function ensureAuthorized(req: Request): boolean {
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const host = req.headers.get("host") || "";
  const isLocal =
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    forwarded === "";
  if (isLocal) return true;

  const auth = req.headers.get("authorization") || "";
  const token = auth.replace("Bearer ", "").trim();
  const cronSecret = process.env.CRON_SECRET;
  const internalToken =
    process.env.API_MACHINE_INTERNAL_TOKEN ||
    process.env.INTERNAL_SERVICE_TOKEN;
  if (cronSecret && token === cronSecret) return true;
  if (internalToken && token === internalToken) return true;
  return false;
}

const SENTINELA_AGENT_TEMPLATE = path.join(
  process.cwd(),
  "src/lib/vps/sentinela/agent.py"
);
const SENTINELA_SERVICE_FILE = path.join(
  process.cwd(),
  "src/lib/vps/sentinela/sentinela.service"
);

const SSH_OPTS = [
  "-o",
  "StrictHostKeyChecking=no",
  "-o",
  "UserKnownHostsFile=/dev/null",
];

export async function POST(req: Request) {
  if (!ensureAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    ip?: string;
    password?: string;
    token?: string;
    user?: string;
    cpu?: number;
    disk?: number;
    ram?: number;
  };
  const { ip, password, token, user = "root", cpu, disk, ram } = body;
  if (!ip || !password || !token) {
    return NextResponse.json(
      { error: "ip, password e token são obrigatórios" },
      { status: 400 }
    );
  }

  const remote = `${user}@${ip}`;
  const tmpDir = await mkdtemp(path.join(tmpdir(), "sentinela-"));

  try {
    const fs = await import("node:fs/promises");
    let agent = await fs.readFile(SENTINELA_AGENT_TEMPLATE, "utf-8");
    agent = agent
      .replaceAll("{{ATLAS_TOKEN}}", token)
      .replaceAll("{{CPU_CORES}}", cpu != null ? String(cpu) : "")
      .replaceAll("{{DISK}}", disk != null ? String(disk) : "")
      .replaceAll("{{RAM}}", ram != null ? String(ram) : "");

    const agentLocalPath = path.join(tmpDir, `agent-${randomUUID()}.py`);
    await writeFile(agentLocalPath, agent);

    await execFileAsync("sshpass", [
      "-p",
      password,
      "ssh",
      ...SSH_OPTS,
      remote,
      "apt update && apt install -y bpytop python3-psutil python3-docker python3-aiohttp && mkdir -p /opt/sentinela",
    ]);

    await execFileAsync("sshpass", [
      "-p",
      password,
      "scp",
      ...SSH_OPTS,
      agentLocalPath,
      `${remote}:/opt/sentinela/agent.py`,
    ]);

    await execFileAsync("sshpass", [
      "-p",
      password,
      "scp",
      ...SSH_OPTS,
      SENTINELA_SERVICE_FILE,
      `${remote}:/etc/systemd/system/sentinela.service`,
    ]);

    await execFileAsync("sshpass", [
      "-p",
      password,
      "ssh",
      ...SSH_OPTS,
      remote,
      "systemctl daemon-reload && systemctl enable --now sentinela",
    ]);

    return NextResponse.json({ ip, status: "installed" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || String(error) },
      { status: 500 }
    );
  } finally {
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
