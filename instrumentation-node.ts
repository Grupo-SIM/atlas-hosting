export async function registerNode() {
  try {
    const { readFileSync } = await import("node:fs");
    const buildTime = readFileSync("BUILD_TIME", "utf8").trim();
    console.log(`[BOOT] Atlas Hosting iniciado — build: ${buildTime}`);
  } catch {
    console.log(
      "[BOOT] Atlas Hosting iniciado — build: desconhecido (dev local?)"
    );
  }

  // A renovação de assinaturas VPS é disparada pelo serviço `vps-cron` do
  // docker-compose, não daqui. Ter um agendador dentro do app além do externo
  // fazia os dois baterem no mesmo endpoint e arriscava cobrança duplicada.
}
