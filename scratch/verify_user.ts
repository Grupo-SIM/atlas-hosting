import { eq } from "drizzle-orm";
import { db } from "./src/lib/db";
import { pgUser } from "./src/lib/db/schema";

async function verifyUser() {
  const email = "devfull00@gmail.com";
  console.log(`Verifying user: ${email}`);

  const result = await db
    .update(pgUser)
    .set({ emailVerified: new Date() })
    .where(eq(pgUser.email, email))
    .returning();

  if (result.length > 0) {
    console.log("User verified successfully!");
  } else {
    console.log("User not found.");
  }
}

verifyUser().catch(console.error);
