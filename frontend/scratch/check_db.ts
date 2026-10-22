import { db } from "../src/lib/db";
import { pgVpsServers } from "../src/lib/db/schema";

async function test() {
  try {
    const servers = await db.select().from(pgVpsServers);
    console.log("--- DEBUG SERVIDORES ---");
    servers.forEach(s => {
      console.log(
        `VPS: ${s.name} | Status: ${s.status} | Processos no Banco: ${s.topProcesses?.length || 0}`
      );
    });
    console.log("------------------------");
  } catch (e) {
    console.error("ERRO NO TESTE:", e);
  }
  process.exit(0);
}

test();
