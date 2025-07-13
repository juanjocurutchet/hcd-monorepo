import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config(); // Carga las variables de .env

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.DB_HOST!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASS!,
    database: process.env.DB_NAME!,
    ssl: "require",
  },
});