import { createResource } from "./resources";
import { db } from "../db";
import { generateManyEmbeddings } from "../ai/embedding";
//import { customAlphabet } from "nanoid";

//const nanoid = customAlphabet('1234567890abcdef', 10);
//const id = nanoid();
//console.log(id);


jest.mock('../db', () => {
    const insertMock = jest.fn(() => ({
        values: jest.fn().mockReturnThis(),
        returning: jest.fn(() => Promise.resolve([{ id: 'res_123' }])),
    }));

    return {
        db: {
            insert: insertMock,
        },
    };
});

jest.mock('../ai/embedding', () => ({
    generateManyEmbeddings: jest.fn(() => Promise.resolve([
        {embedding: [0.1, 0.2, 0.3], content: 'test sentence'}
    ])),
}));

describe('createResource', () => {
    it('create a resource and embeddings successfully', async () => {
        const result = await createResource({content: 'This is test content.'});
        expect(result).toBe('Resource successfully create and embedded.');
    });

    it('fails on invalid input', async() => {
        const result = await createResource({ content: ''});
        expect(result).toMatch(/Error/);
    });

    it('handles unexpected error gracefully', async () => {
        (generateManyEmbeddings as jest.Mock).mockImplementation(() => {
            throw new Error('Embedding failure');
        })

        const result = await createResource({ content: 'Valid but causes fail'});
        expect(result).toBe('Embedding failure');
    })

})
