import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import { resources } from "./db/schema/resources";

export async function updateResource(id: string, data: { content?: string }) {
  await db
    .update(resources)
    .set({
      ...(data.content && { content: data.content }),
      updatedAt: sql`now()`, 
    })
    .where(eq(resources.id, id));
}