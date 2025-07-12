import type { Config } from "drizzle-kit";

export default {
  schema: "./apps/hcd-admin/lib/db/schema.ts",
  out: "./apps/hcd-admin/drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;