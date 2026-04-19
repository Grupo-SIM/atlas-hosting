
import { db } from "../src/lib/db";
import { pgSystemConfig } from "../src/lib/db/schema";

async function checkConfig() {
  const config = await db.query.pgSystemConfig.findFirst();
  console.log("System Config:", config || "NULL");
  process.exit(0);
}

checkConfig().catch(console.error);
