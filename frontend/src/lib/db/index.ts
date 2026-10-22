import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema/index";

export const db = drizzle<typeof schema>(process.env.DATABASE_URL ?? "", {
  schema,
});
