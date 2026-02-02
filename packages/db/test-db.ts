import { db } from "./src";
import { users } from "./src/schema";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Connecting...");
    try {
        const result = await db.execute(sql`SELECT NOW()`);
        console.log("Connection successful:", result);

        console.log("Checking users table...");
        const userList = await db.select().from(users).limit(1);
        console.log("Users table check:", userList);

        process.exit(0);
    } catch (e) {
        console.error("DB Error:", e);
        process.exit(1);
    }
}

main();
