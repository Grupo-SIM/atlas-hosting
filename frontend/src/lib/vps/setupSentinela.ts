import agentStr from "./sentinela/agent.py" with { type: "text" };
import serviceStr from "./sentinela/sentinela.service" with { type: "text" };
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
      const pureToken = token.replace("atlas_", "");
      const agentName = `agent_${pureToken}`;
      const serviceName = `sentinela_${pureToken}`;

      // Transferir arquivos para o servidor
      const agent = agentStr
        .replaceAll("{{ATLAS_TOKEN}}", token)
        .replaceAll("{{ATLAS_BASE_URL}}", process.env.NEXT_PUBLIC_BASE_URL!)
        .replaceAll("{{CPU}}", String(cpu ?? ""))
        .replaceAll("{{DISK}}", String(disk ?? ""))
        .replaceAll("{{RAM}}", String(ram ?? ""));

      const service = serviceStr.replaceAll("{{AGENT_FILENAME}}", agentName);

      await Promise.all([
        transferFile({
          file: agent,
          remote,
          remotePath: `/opt/sentinela/${agentName}.py`,
          sshpass,
        }),
        transferFile({
          file: service,
          remote,
          remotePath: `/etc/systemd/system/${serviceName}.service`,
          sshpass,
        }),
      ]);

      // Iniciar Sentinela
      await Bun.$`${sshpass} ${ssh} "
				systemctl daemon-reload
				systemctl enable --now ${serviceName}
			"`.quiet();
    })(),
  ]);
};
