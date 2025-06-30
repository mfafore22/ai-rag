import { nanoid } from "nanoid";
import { index, pgTable, text, varchar, vector } from "drizzle-orm/pg-core";
import { resources } from "./resources";

export const embeddings = pgTable(
  "embeddings",
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .$defaultFn(() => nanoid()),

    resourceId: varchar("resource_id", { length: 191 }).references(() => resources.id, {
      onDelete: "cascade",
    }),

    content: text("content").notNull(),

    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
  },
  
  (table) => ({
    embeddingIndex: index("embedding_index").on(table.embedding),
  })
);