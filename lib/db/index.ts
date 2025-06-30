import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { env } from "@/lib/env.mjs";

const sql = neon(env.DATABASE_URL_UNPOOLED);
export const db = drizzle(sql);
export { sql };

