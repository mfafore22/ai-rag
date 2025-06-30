import { db, sql } from "./index";
import { resources } from "./schema/resources";

async function testConnection() {
    try {
        console.log("🔍 Testing database connection...");
        
        // First, test raw SQL connection
        const sqlResult = await sql`SELECT 1 as test`;
        console.log("✅ SQL Connection test successful!", sqlResult);

        // Then test Drizzle with raw SQL
        const drizzleResult = await sql`SELECT * FROM resources LIMIT 1`;
        console.log("✅ Drizzle Connection test successful!");
        console.log("📊 Query result:", drizzleResult);
    } catch (error) {
        console.error("❌ Connection failed:", error);
        // Log the full error for debugging
        if (error instanceof Error) {
            console.error("Error details:", error.message);
        }
    }
}

testConnection();