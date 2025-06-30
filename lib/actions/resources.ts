'use server';

import {
  NewResourceParams,
  insertResourceSchema,
  resources,
} from '../db/schema/resources';
import { db } from '../db';
import { generateManyEmbeddings } from '../ai/embedding';
import { embeddings } from '../db/schema/embeddings';

export const createResource = async (input: NewResourceParams) => {
  try {
    const payload = insertResourceSchema.parse(input);
     
    const contentWithoutLineBreaks = payload.content.replace(/\n/g, " ");

    const [resource] = await db
      .insert(resources)
      .values({ content: contentWithoutLineBreaks })
      .returning();
    const e = await generateManyEmbeddings(contentWithoutLineBreaks)
    await db
      .insert(embeddings)
      .values(e.map((embed) => ({ resourceId: resource.id, ...embed })));
    return "Resource successfully created and embedded.";

    
  } catch (error) {
    return error instanceof Error && error.message.length > 0
      ? error.message
      : 'Error, please try again.';
  }
};