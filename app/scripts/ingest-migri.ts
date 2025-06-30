import fs from 'fs';
import { nanoid } from 'nanoid';
import { generateManyEmbeddings } from '@/lib/ai/embedding';
import { db } from '@/lib/db';
import { embeddings } from '@/lib/db/schema/embeddings';


async function ingestFile (filePath: string, resourceId: string){
       console.log(`Reading file: ${filePath}`);
       const fileContent = fs.readFileSync(filePath, 'utf-8');

       const chunks = await generateManyEmbeddings(fileContent);

       await db.insert(embeddings).values(
        chunks.map(({content, embedding}) => ({
            id: nanoid(),
            content,
            embedding,
            resourceId,
        }))
       );

       console.log(`Done ingesting: ${filePath}`);
}

async function run() {
    await ingestFile('data/work.txt', 'migri-work');
    await ingestFile('data/study.txt', 'migri-study');
    await ingestFile('data/family.txt', 'migri-family');
}

run().catch(err => {
    console.error('Failed:' , err);
});