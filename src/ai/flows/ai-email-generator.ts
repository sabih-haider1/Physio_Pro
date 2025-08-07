
'use server';
/**
 * @fileOverview An AI agent to assist in drafting emails.
 *
 * - generateEmailBody - A function that generates an email body based on a prompt.
 * - AiEmailGeneratorInput - The input type for the generateEmailBody function.
 * - AiEmailGeneratorOutput - The return type for the generateEmailBody function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiEmailGeneratorInputSchema = z.object({
  prompt: z.string().describe("User's instruction or topic for the email content. For example: 'Draft a welcome email for new clinicians highlighting AI features.'"),
  subject: z.string().optional().describe("Optional subject line to give context to the AI."),
  recipientContext: z.string().optional().describe("Optional context about the recipient(s), e.g., 'new clinicians', 'patients with overdue programs'.")
});
export type AiEmailGeneratorInput = z.infer<typeof AiEmailGeneratorInputSchema>;

const AiEmailGeneratorOutputSchema = z.object({
  generatedEmailBody: z.string().describe("The AI-generated email body, ready to be reviewed and sent."),
  suggestedSubject: z.string().optional().describe("An optional AI-suggested subject line if one was not provided or if the AI can improve it.")
});
export type AiEmailGeneratorOutput = z.infer<typeof AiEmailGeneratorOutputSchema>;

export async function generateEmailBody(input: AiEmailGeneratorInput): Promise<AiEmailGeneratorOutput> {
  return aiEmailGeneratorFlow(input);
}

const emailPrompt = ai.definePrompt({
  name: 'aiEmailGeneratorPrompt',
  input: {schema: AiEmailGeneratorInputSchema},
  output: {schema: AiEmailGeneratorOutputSchema},
  prompt: `You are an expert communications assistant for an Exercise Prescription Software platform called PhysioPro.
Your task is to draft a professional and engaging email body based on the user's prompt.

User's Email Prompt: {{{prompt}}}
{{#if subject}}
Email Subject Context: {{{subject}}}
{{/if}}
{{#if recipientContext}}
Recipient Context: {{{recipientContext}}}
{{/if}}

Generate a suitable email body. If the user did not provide a subject or you can improve it, suggest a subject line as well.
Keep the tone appropriate for the context given (e.g., welcoming, informative, urgent).
The output should be formatted as JSON.
Ensure the email body is well-structured and ready to be sent.
Do not include greetings like "Dear [Name]," or sign-offs like "Sincerely, The PhysioPro Team" unless specifically asked in the prompt, as these will be handled by the user. Focus on the core message.
If a subject is suggested, ensure it is concise and relevant.
`,
});

const aiEmailGeneratorFlow = ai.defineFlow(
  {
    name: 'aiEmailGeneratorFlow',
    inputSchema: AiEmailGeneratorInputSchema,
    outputSchema: AiEmailGeneratorOutputSchema,
  },
  async (input) => {
    const {output} = await emailPrompt(input);
    return output!;
  }
);
