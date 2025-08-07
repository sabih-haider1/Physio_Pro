
'use server';
/**
 * @fileOverview An AI agent to validate patient feedback on exercises.
 *
 * - validateFeedback - A function that handles the feedback validation process.
 * - ValidateFeedbackInput - The input type for the validateFeedback function.
 * - ValidateFeedbackOutput - The return type for the validateFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateFeedbackInputSchema = z.object({
  exerciseName: z.string().describe('The name of the exercise the feedback is for.'),
  painLevel: z.number().min(1).max(10).describe('The level of pain experienced (1-10).'),
  comments: z.string().optional().describe('The patient comments about the exercise.'),
});
export type ValidateFeedbackInput = z.infer<typeof ValidateFeedbackInputSchema>;

const ValidateFeedbackOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the feedback is considered valid and meaningful. For example, if comments are too short or vague (e.g., "ok", "good", "it hurts") and pain level is high, it might be invalid. Pain level 1-3 with minimal comments could be valid.'),
  suggestions: z.string().optional().describe('Suggestions for improving the feedback, if any. E.g., "Please describe where you felt the pain." or "Can you provide more details about the difficulty?"'),
});
export type ValidateFeedbackOutput = z.infer<typeof ValidateFeedbackOutputSchema>;

export async function validateFeedback(input: ValidateFeedbackInput): Promise<ValidateFeedbackOutput> {
  return validateFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validateFeedbackPrompt',
  input: {schema: ValidateFeedbackInputSchema},
  output: {schema: ValidateFeedbackOutputSchema},
  prompt: `You are an AI assistant that validates patient feedback on exercises for a clinician.
The goal is to ensure feedback is useful.

Exercise Name: {{{exerciseName}}}
Pain Level (1-10, where 10 is max pain): {{{painLevel}}}
Patient Comments: "{{{comments}}}"

Analyze the pain level and comments.
- If comments are very short (e.g., "ok", "good", "it hurts", "felt fine") AND the pain level is moderate to high (e.g., 4-10), the feedback is likely NOT valid. Suggest asking for more details about the pain (location, type).
- If comments are very short but pain level is low (e.g., 1-3), it can be considered valid.
- If comments are reasonably descriptive (e.g., "Felt a pinch in my left knee", "Easy to do", "Struggled with the last set"), it's generally valid.
- If no comments are provided but pain level is high (e.g. 7-10), it is not valid. Suggest asking for comments.
- If no comments are provided and pain level is moderate (e.g. 4-6), it is not valid. Suggest asking for comments.
- If no comments are provided and pain level is low (e.g. 1-3), it is valid.

Set 'isValid' to true or false.
If 'isValid' is false, provide constructive 'suggestions' for the patient to improve their feedback.
The output must be in JSON format.
Example for invalid feedback:
{
  "isValid": false,
  "suggestions": "Please describe where you felt the pain and what type of pain it was."
}
Example for valid feedback:
{
  "isValid": true
}
`,
});

const validateFeedbackFlow = ai.defineFlow(
  {
    name: 'validateFeedbackFlow',
    inputSchema: ValidateFeedbackInputSchema,
    outputSchema: ValidateFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure a default valid response if the model fails to provide one, though unlikely with strong prompting.
    return output || { isValid: true };
  }
);

