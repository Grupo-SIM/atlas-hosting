import { readFile, mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { render } from "@react-email/render";
import { AtlasNotificationEmail } from "../frontend/src/emails/atlas-notification";
import { renewalEmailMessage } from "../frontend/src/lib/server/subscriptions/renewal-policy";

const logo = (await sharp(await readFile("frontend/public/atlas-logo.png")).resize({ width: 240 }).png().toBuffer()).toString("base64");
await mkdir("docs/examples", { recursive: true });
for (const days of [15, 8]) {
  const html = await render(AtlasNotificationEmail({
    firstName: "Bruno", organizationName: "Atlas Hosting",
    title: `Sua assinatura Cloud VPS — Cloud VPS 4 renova em ${days} dias`,
    message: renewalEmailMessage("Cloud VPS — Cloud VPS 4", 126.49, 1, new Date("2026-11-20T12:00:00-03:00"), "4 vCPU · 8 GB RAM · 100 GB SSD"),
    severity: "warning", actionText: "Pagar renovação",
    actionUrl: "https://atlashosting.com.br/checkout/exemplo-renovacao?initialStep=payment",
    timestamp: `Exemplo de email — ${days} dias antes da renovação`,
  }));
  const filename = `docs/examples/vps-renewal-${days}-days.html`;
  await writeFile(filename, html.replaceAll("cid:atlaslogo", `data:image/png;base64,${logo}`));
  console.log(filename);
}
