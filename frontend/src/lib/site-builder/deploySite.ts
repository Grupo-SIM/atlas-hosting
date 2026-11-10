import { execFile, spawn } from "node:child_process";
import { copyFile, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import {
  assertValidDomain,
  buildDeployScript,
  buildRemoveScript,
  buildSuspendScript,
} from "./caddy";
import {
  describeError,
  explainDeployError,
  type PublishTargetTag,
  publishLogger,
  redact,
} from "./publishLog";

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

type Log = ReturnType<typeof publishLogger>;

/** Roda uma etapa do deploy registrando início, fim, duração e, se falhar, o motivo. */
async function stage<T>(
  log: Log,
  name: string,
  target: DeployTarget,
  data: Record<string, unknown>,
  fn: () => Promise<T>
): Promise<T> {
  const startedAt = Date.now();
  log.info(`Deploy, etapa "${name}": iniciando`, data);
  try {
    const result = await fn();
    log.info(`Deploy, etapa "${name}": ok`, { ms: Date.now() - startedAt });
    return result;
  } catch (error) {
    const stderr = (error as { stderr?: string })?.stderr;
    log.error(`Deploy, etapa "${name}": FALHOU`, {
      ...data,
      dica: explainDeployError(error),
      erro: describeError(error, [target.password]),
      ms: Date.now() - startedAt,
      stderr: stderr
        ? redact(stderr, [target.password]).slice(-800)
        : undefined,
    });
    throw error;
  }
}

/** Executa um script bash no servidor lendo-o da entrada padrão. */
async function runRemoteScript(
  target: DeployTarget,
  script: string,
  log: Log = publishLogger("-")
) {
  if (target.local) {
    await runLocal("bash", ["-s"], process.env, script);
    return;
  }
  const ssh = sshInvocation(target);
  const { args, bin } = ssh.run("ssh", [ssh.remote, "bash -s"]);
  const { stderr, stdout } = await runLocal(bin, args, ssh.env, script);
  // Saída do script (Caddy, container, validação): só o final, sem segredos.
  const out = redact(`${stdout}${stderr}`.trim(), [target.password]);
  if (out) log.info("Saída do script remoto", { saida: out.slice(-600) });
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
  /** Só rotula os logs (`atlas_vm` ou `user_vps`). */
  logTag?: PublishTargetTag;
  target: DeployTarget;
}) {
  const log = publishLogger(args.logTag ?? "-");
  const domain = assertValidDomain(args.domain);
  const via = args.target.local
    ? "bash local"
    : `ssh ${args.target.user ?? "root"}@${args.target.ip}`;
  const base = {
    arquivos: args.files.length,
    domain,
    metodo: via,
    usaSenha: Boolean(args.target.password),
  };
  const ssh = args.target.local
    ? null
    : await stage(log, "validar destino SSH", args.target, base, async () =>
        sshInvocation(args.target)
      );
  const releaseId = String(Date.now());
  const workDir = await mkdtemp(path.join(tmpdir(), "site-deploy-"));

  try {
    const siteDir = path.join(workDir, "site");
    await stage(log, "gravar arquivos do site", args.target, base, async () => {
      for (const file of args.files) {
        const dest = path.join(siteDir, file.path);
        // Defesa extra: caminhos vêm de slugs validados, mas nunca escapam da pasta do site.
        if (!dest.startsWith(`${siteDir}${path.sep}`)) {
          throw new Error(`Caminho inválido: ${file.path}`);
        }
        await mkdir(path.dirname(dest), { recursive: true });
        await writeFile(dest, file.content, "utf8");
      }
    });

    const archive = path.join(workDir, "site.tgz");
    await stage(log, "empacotar (tar)", args.target, base, () =>
      execFileAsync("tar", ["-czf", archive, "-C", siteDir, "."])
    );

    const remoteArchive = `/tmp/atlas-site-${releaseId}.tgz`;
    await stage(
      log,
      ssh ? "enviar pacote (scp)" : "copiar pacote (local)",
      args.target,
      { ...base, destino: remoteArchive },
      async () => {
        if (ssh) {
          const scp = ssh.run("scp", [
            archive,
            `${ssh.remote}:${remoteArchive}`,
          ]);
          await runLocal(scp.bin, scp.args, ssh.env);
        } else {
          await copyFile(archive, remoteArchive);
        }
      }
    );

    await stage(log, "rodar script de deploy", args.target, base, () =>
      runRemoteScript(
        args.target,
        buildDeployScript({
          archive: remoteArchive,
          caddyRoot: args.target.caddyRoot,
          domain,
          includeWww: args.includeWww,
          releaseId,
          webRoot: args.target.webRoot,
        }),
        log
      )
    );
  } finally {
    await rm(workDir, { force: true, recursive: true }).catch(() => {});
  }
}

/**
 * Suspende o site por falta de pagamento: o endereço passa a servir a página de
 * suspensão. Os arquivos do site e o DNS ficam intactos, então republicar
 * (`runPublish`) devolve o site ao ar. Seguro de repetir.
 */
export async function suspendSite(args: {
  domain: string;
  /** `true` para domínio próprio (atende também `www.`). */
  includeWww: boolean;
  target: DeployTarget;
}) {
  const domain = assertValidDomain(args.domain);
  await runRemoteScript(
    args.target,
    buildSuspendScript({
      caddyRoot: args.target.caddyRoot,
      domain,
      includeWww: args.includeWww,
      webRoot: args.target.webRoot,
    })
  );
}

/** Tira o site do servidor: apaga a pasta e o bloco do Caddy. Seguro de repetir. */
export async function removeSite(args: {
  domain: string;
  target: DeployTarget;
}) {
  const domain = assertValidDomain(args.domain);
  await runRemoteScript(
    args.target,
    buildRemoveScript({ domain, webRoot: args.target.webRoot })
  );
}
