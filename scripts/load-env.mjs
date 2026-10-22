import { fileURLToPath } from "node:url";
import { config } from "dotenv";

// O app vive em frontend/; o .env com DATABASE_URL e demais segredos fica lá.
config({ path: fileURLToPath(new URL("../frontend/.env", import.meta.url)) });
