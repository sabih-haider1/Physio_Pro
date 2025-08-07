
'use server';

/**
 * @fileOverview AI-powered exercise search flow for clinicians.
 *
 * - aiExerciseSearch - A function that allows clinicians to search the exercise library using natural language queries.
 * - AiExerciseSearchInput - The input type for the aiExerciseSearch function.
 * - AiExerciseSearchOutput - The return type for the aiExerciseSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiExerciseSearchInputSchema = z.object({
  query: z
    .string()
    .describe(
      'A natural language query to search the exercise library, such as "exercises for rotator cuff rehab".'
    ),
  // Optional: Could add context like existing exercises in a program to refine search
  // exerciseLibrary: z.array(z.string()).optional().describe("Optional list of all available exercise names for context"),
});
export type AiExerciseSearchInput = z.infer<typeof AiExerciseSearchInputSchema>;

const AiExerciseSearchOutputSchema = z.object({
  results: z
    .array(z.string())
    .describe('A list of exercise names that best match the search query. Limit to 5-7 relevant results.'),
});
export type AiExerciseSearchOutput = z.infer<typeof AiExerciseSearchOutputSchema>;

export async function aiExerciseSearch(input: AiExerciseSearchInput): Promise<AiExerciseSearchOutput> {
  return aiExerciseSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiExerciseSearchPrompt',
  input: {schema: AiExerciseSearchInputSchema},
  output: {schema: AiExerciseSearchOutputSchema},
  prompt: `You are an AI assistant designed to help clinicians find relevant exercises for their patients.
Given the following search query, provide a list of exercise names that match the query.
Return ONLY the names of the exercises. Do not provide any additional information, descriptions, or numbering.
Prioritize relevance and aim for 5-7 results if many are applicable.

Query: {{{query}}}
`,
});

const aiExerciseSearchFlow = ai.defineFlow(
  {
    name: 'aiExerciseSearchFlow',
    inputSchema: AiExerciseSearchInputSchema,
    outputSchema: AiExerciseSearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
        results: output?.results || [],
    };
  }
);

