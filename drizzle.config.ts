import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // Use the standard 'postgres' driver for migrations (drizzle-kit cannot
  // drive the @neondatabase/serverless WebSocket client internally).
  // The app itself still uses @neondatabase/serverless at runtime.
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
