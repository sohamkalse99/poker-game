import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres"; // or bun:sqlite if preferred, but user asked for Postgres
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgres://postgres:mysecretpassword@localhost:5432/poker-game";
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
export * from "./schema";
