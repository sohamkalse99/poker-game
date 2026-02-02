import type { Config } from "drizzle-kit";

export default {
    schema: "./src/schema.ts",
    out: "./drizzle",
    driver: "pg",
    dbCredentials: {
        connectionString: process.env.DATABASE_URL || "postgres://postgres:mysecretpassword@localhost:5432/poker-game",
    },
} satisfies Config;
