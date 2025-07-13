import type { Config } from "drizzle-kit";

export default {
  schema: "./apps/hcd-admin/lib/db/schema.ts",
  out: "./apps/hcd-admin/drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.DB_HOST!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASS!,
    database: process.env.DB_NAME!,
    ssl: "require"
  },
} satisfies Config;