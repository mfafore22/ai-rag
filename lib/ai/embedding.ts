import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import { db } from '../db';
import { cosineDistance, desc, gt, sql } from 'drizzle-orm';
import { embeddings } from '../db/schema/embeddings';


const embeddingModel = openai.embedding('text-embedding-ada-002');



const generateChunks = (input: string, chunkSize = 500): string[] => {
  const chunks: string [] = [];
  for (let i =0 ; i < input.length; i += chunkSize){
    chunks.push(input.slice(i, i + chunkSize));
  }
  return chunks ;
}
  

export const generateEmbedding = async (value: string): Promise<number[]> => {
 try{
  const input = value.replaceAll('/\n/g', ' ');
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
 }catch(error){
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
 }
};

export const generateManyEmbeddings = async (
  value: string,
): Promise<Array<{ embedding: number[]; content: string }>> => {
 try{
  const chunks = generateChunks(value);
  const { embeddings: generatedEmbeddings} = await embedMany({
    model: embeddingModel,
    values: chunks,
  });
  return generatedEmbeddings.map((embedding, i) => ({content: chunks[i], embedding}));
}catch(error){
    console.error('Error generating emdeddings:', error);
    throw new Error('Failed to generate embeddings');
}
};



export const findRelevantContent = async (description: string) => {
  try {
    const embedding = await generateEmbedding(description);

    
    const similarGuides = await db
      .select({ content: embeddings.content, 
        similarity: sql<number>`1 - ${cosineDistance(embeddings.embedding, embedding)}`,
      })
      .from(embeddings)
      .where(sql`(${embeddings.embedding} <=> ${embedding} < 0.7)`)
      .orderBy(sql`(${embeddings.embedding} <=> ${embedding})`)
      .limit(4);

    if (!similarGuides.length) {
      console.warn('No relevant content found for:', description);
      // Return empty array or a message object if you prefer
      return [];
    }

    console.log('Relevant content found:', similarGuides);
    return similarGuides;
  } catch (error) {
    console.error('Error finding relevant content:', error);
    throw new Error('Failed to find relevant content');
  }
};