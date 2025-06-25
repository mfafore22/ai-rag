import { createResource } from '@/lib/actions/resources';
import { openai } from '@ai-sdk/openai';
import { streamText, tool , convertToCoreMessages} from 'ai';
import { z } from 'zod';
import { findRelevantContent } from '@/lib/ai/embedding';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface Input {

    text: any;
}

function isTooPersonal (input: Input ): boolean{

    const text = String(input.text).toLowerCase();
    const bannedPatterns: RegExp[] = [
         /how old/i,
    /what.*your.*(name|age|religion|family|health|marital|spouse|children)/i,
    /do you have (a wife|husband|children|any illness|a disease)/i,
    /where.*you.*from/i,
    /are.*you.*married/i,
    /\b(my|our) (wife|husband|child|children|mother|father|health|disease)\b/i,
    ];

    return bannedPatterns.some((pattern) => pattern.test(text));
}


export async function POST(req: Request) {
  const { messages } = await req.json();

  const lastUserMessage = messages[messages.length - 1];
  const input = {text: lastUserMessage?.content || ''};
  if (isTooPersonal(input)){
    return new Response (
        JSON.stringify({error: "I'm sorry, but i cannot handle questions involving personal or sensitive information"}),
        {status: 400, headers: {'Content-Type' : 'application/json'}}
    );
  }

  

  const result = streamText({
    model: openai('gpt-4o'),
    messages: convertToCoreMessages(messages),
    system: `You are acting as a polite and professional Finnish immigration officer. 
              You provide accurate, detailed, and helpful information about Finland’s immigration process.
              You do not collect or ask for any personal data. Avoid questions about age, religion, name, nationality, marital status, family, or health. 
             Instead, ask neutral questions like: "Is this related to work permits or study permits?" or "Are you in Finland or applying from abroad?"

             Your responses should follow the tone and accuracy expected from an official Finnish immigration officer. 
             You are not a lawyer, so you do not give legal advice. Stick to official procedure, requirements, and steps.
             Use information from the internal knowledge base. If the user says something useful (e.g., an immigration rule), use the addResource tool to store it.

             Use getInformation to retrieve relevant knowledge from your internal resource base when answering questions.`,
    tools: {
  addResource: tool({
    description: `add a resource to your knowledge base.
      If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
    parameters: z.object({
      content: z.string().describe('the content or resource to add to the knowledge base'),
    }),
    execute: async ({ content }) => {
      try {
        return await createResource({ content });
      } catch (error) {
        console.error('Error in addResource:', error);
        throw new Error('Failed to add resource');
      }
    },
  }),
  getInformation: tool({
    description: `get information from your knowledge base to answer questions.`,
    parameters: z.object({
      question: z.string().describe('the users question'),
    }),
    execute: async ({ question }) => {
      try {
        return await findRelevantContent(question);
      } catch (error) {
        console.error('Error in getInformation:', error);
        throw new Error('Failed to get information');
      }
    },
  }),
}
  });

  return result.toDataStreamResponse();
}