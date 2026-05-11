export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const runRenewal = async () => {
    const port = process.env.PORT || "3000";
    try {
      const res = await fetch(
        `http://localhost:${port}/api/internal/vps-subscriptions/renew`,
        { method: "POST" }
      );
      const json = await res.json().catch(() => null);
      console.log(`[CRON] Renovação VPS concluída:`, json);
    } catch (err) {
      console.error("[CRON] Erro na renovação de assinaturas VPS:", err);
    }
  };

  // Fires daily at 08:00 (server timezone, set TZ=America/Fortaleza in docker-compose)
  const scheduleNext = () => {
    const now = new Date();
    const next = new Date();
    next.setHours(8, 0, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    const ms = next.getTime() - now.getTime();
    setTimeout(async () => {
      await runRenewal();
      setInterval(runRenewal, 24 * 60 * 60 * 1000);
    }, ms);
    console.log(`[CRON] Próxima renovação VPS agendada para: ${next.toISOString()}`);
  };

  scheduleNext();
}
