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

  const { startInternalScheduler } = await import(
    "./src/lib/server/internal-scheduler"
  );
  startInternalScheduler();
}
