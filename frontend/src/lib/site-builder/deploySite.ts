import { execFile, spawn } from "node:child_process";
import { copyFile, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { assertValidDomain, buildDeployScript } from "./caddy";

const execFileAsync = promisify(execFile);

export interface DeployTarget {
  ip: string;
  /** Chave privada do Atlas (ex.: `ssh/atlashosting.key`). Usada quando não há senha. */
  keyPath?: string;
  /** Senha SSH — usada só durante esta chamada, nunca gravada. */
  password?: string;
  user?: string;
  /**
   * O Atlas roda na própria VM que hospeda os sites: roda o script aqui mesmo (bash local), sem SSH.
   * Exige `webRoot` e o `Caddyfile.base` montados no container com o mesmo caminho do servidor.
   */
  local?: boolean;
  /** Pasta dos sites no servidor e como o Caddy a enxerga (ver `caddy.ts`). */
  caddyRoot?: string;
  webRoot?: string;
}

export interface StaticSiteFile {
  content: string;
  path: string;
}

const SSH_OPTS = [
  "-o",
  "StrictHostKeyChecking=no",
  "-o",
  "UserKnownHostsFile=/dev/null",
  "-o",
  "ConnectTimeout=20",
];

export const IPV4_RE = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const HOSTNAME_RE = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

function sshInvocation(target: DeployTarget) {
  if (!(IPV4_RE.test(target.ip) || HOSTNAME_RE.test(target.ip)))
    throw new Error("Endereço do servidor inválido");
  const remote = `${target.user ?? "root"}@${target.ip}`;
  if (!/^[a-z_][a-z0-9_-]*@[a-z0-9.-]+$/i.test(remote)) {
    throw new Error("Usuário SSH inválido");
  }

  const keyArgs = target.keyPath ? ["-i", target.keyPath] : [];
  // `sshpass -e` lê a senha de SSHPASS: ela não aparece na lista de processos.
  const prefix = target.password ? ["sshpass", "-e"] : [];
  const env = target.password
    ? { ...process.env, SSHPASS: target.password }
    : process.env;

  return {
    env,
    remote,
    run: (cmd: "scp" | "ssh", args: string[]) => {
      const [bin, ...rest] = [...prefix, cmd];
      return { args: [...rest, ...SSH_OPTS, ...keyArgs, ...args], bin };
    },
  };
}

async function runLocal(
  bin: string,
  args: string[],
  env: NodeJS.ProcessEnv,
  stdin?: string
) {
  if (stdin === undefined) {
    return execFileAsync(bin, args, { env, maxBuffer: 10 * 1024 * 1024 });
  }
  return new Promise<{ stderr: string; stdout: string }>((resolve, reject) => {
    const child = spawn(bin, args, { env });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", d => {
      stdout += d;
    });
    child.stderr.on("data", d => {
      stderr += d;
    });
    child.on("error", reject);
    child.on("close", code =>
      code === 0
        ? resolve({ stderr, stdout })
        : reject(new Error(stderr.trim() || `${bin} saiu com código ${code}`))
    );
    child.stdin.end(stdin);
  });
}

/** Executa um script bash no servidor lendo-o da entrada padrão. */
async function runRemoteScript(target: DeployTarget, script: string) {
  if (target.local) {
    await runLocal("bash", ["-s"], process.env, script);
    return;
  }
  const ssh = sshInvocation(target);
  const { args, bin } = ssh.run("ssh", [ssh.remote, "bash -s"]);
  await runLocal(bin, args, ssh.env, script);
}

/**
 * Publica o site estático no servidor: empacota, envia, extrai numa release nova, troca o
 * link `current` e garante o container de origem. Mesmo padrão do `setupSentinela` (SSH/SCP), mas com
 * `execFile` para funcionar no Node do container de produção.
 */
export async function deploySite(args: {
  domain: string;
  files: StaticSiteFile[];
  /** `true` para domínio próprio (atende também `www.`). */
  includeWww: boolean;
  target: DeployTarget;
}) {
  const domain = assertValidDomain(args.domain);
  const ssh = args.target.local ? null : sshInvocation(args.target);
  const releaseId = String(Date.now());
  const workDir = await mkdtemp(path.join(tmpdir(), "site-deploy-"));

  try {
    const siteDir = path.join(workDir, "site");
    for (const file of args.files) {
      const dest = path.join(siteDir, file.path);
      // Defesa extra: caminhos vêm de slugs validados, mas nunca escapam da pasta do site.
      if (!dest.startsWith(`${siteDir}${path.sep}`)) {
        throw new Error(`Caminho inválido: ${file.path}`);
      }
      await mkdir(path.dirname(dest), { recursive: true });
      await writeFile(dest, file.content, "utf8");
    }

    const archive = path.join(workDir, "site.tgz");
    await execFileAsync("tar", ["-czf", archive, "-C", siteDir, "."]);

    const remoteArchive = `/tmp/atlas-site-${releaseId}.tgz`;
    if (ssh) {
      const scp = ssh.run("scp", [archive, `${ssh.remote}:${remoteArchive}`]);
      await runLocal(scp.bin, scp.args, ssh.env);
    } else {
      await copyFile(archive, remoteArchive);
    }

    await runRemoteScript(
      args.target,
      buildDeployScript({
        archive: remoteArchive,
        caddyRoot: args.target.caddyRoot,
        domain,
        includeWww: args.includeWww,
        releaseId,
        webRoot: args.target.webRoot,
      })
    );
  } finally {
    await rm(workDir, { force: true, recursive: true }).catch(() => {});
  }
}
