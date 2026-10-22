import { db } from "../src/lib/db";
import { pgSystemConfig } from "../src/lib/db/schema";

async function seedConfig() {
  const config = await db.query.pgSystemConfig.findFirst();
  if (!config) {
    console.log("Seeding initial system config...");
    await db.insert(pgSystemConfig).values({
      domainFee: 5.0,
      minWithdrawalAmount: 50.0,
      referrerCommission: 10.0, // 10%
    });
    console.log("System config seeded successfully.");
  } else {
    console.log("System config already exists.");
  }
  process.exit(0);
}

seedConfig().catch(console.error);
