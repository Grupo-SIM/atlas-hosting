import agentStr from "./sentinela/agent.py";
import service from "./sentinela/sentinela.service";
import { transferFile } from "./utils";

interface SetupSentinelaArgs {
  overrides?: {
    /** Amount of cores. */
    cpu?: number;
    /** Total storage in GB. */
    disk?: number;
    /** RAM in GB. */
    ram?: number;
  };
  token: string;
  vm: {
    ip: string;
    password: string;
    user?: string;
  };
}

export const setupSentinela = async ({
  overrides: { cpu, disk, ram } = {},
  token,
  vm: { ip, password, user = "root" },
}: SetupSentinelaArgs) => {
  const remote = `${user}@${ip}`;
  const sshpass = ["sshpass", "-p", `${password}`];
  const ssh = ["ssh", remote];

  await Promise.all([
    // Instalar dependências
    Bun.$`${sshpass} ${ssh} "
			apt update
			apt install bpytop python3-psutil python3-docker python3-aiohttp -y
		"`.quiet(),
    (async () => {
      // Transferir arquivos para o servidor
      const agent = agentStr
        .replaceAll("{{ATLAS_TOKEN}}", token)
        .replaceAll("{{CPU}}", String(cpu ?? ""))
        .replaceAll("{{DISK}}", String(disk ?? ""))
        .replaceAll("{{RAM}}", String(ram ?? ""));

      await Promise.all([
        transferFile({
          file: agent,
          remote,
          remotePath: "/opt/sentinela/agent.py",
          sshpass,
        }),
        transferFile({
          file: service,
          remote,
          remotePath: "/etc/systemd/system/sentinela.service",
          sshpass,
        }),
      ]);

      // Iniciar Sentinela
      await Bun.$`${sshpass} ${ssh} "
				systemctl daemon-reload
				systemctl enable --now sentinela
			"`.quiet();
    })(),
  ]);
};
