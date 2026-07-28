import agentStr from "./sentinela/agent.py";
import service from "./sentinela/sentinela.service";
import { transferFile } from "./utils";

interface SetupSentinelaArgs {
  token: string;
  vm: {
    ip: string;
    password: string;
    user?: string;
  };
}

export const setupSentinela = async ({
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
      const agent = agentStr.replaceAll("{{ATLAS_TOKEN}}", token);
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
