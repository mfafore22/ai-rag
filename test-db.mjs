import postgres from 'postgres';
import { env } from "./lib/env.mjs";

async function testConnection() {
  console.log('Testing database connection...');
  try {
    const sql = postgres(env.DATABASE_URL);
    await sql`SELECT 1`;
    console.log('Database connection successful!');
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
  process.exit(0);
}

testConnection();
