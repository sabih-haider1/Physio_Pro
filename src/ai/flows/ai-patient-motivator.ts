
'use server';
/**
 * @fileOverview An AI agent to generate personalized motivational messages for patients.
 *
 * - generateMotivationalMessage - A function that generates a motivationalMessage.
 * - AiPatientMotivationInput - The input type for the generateMotivationalMessage function.
 * - AiPatientMotivationOutput - The return type for the generateMotivationalMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiPatientMotivationInputSchema = z.object({
  patientName: z.string().describe("The patient's first name."),
  currentProgramName: z.string().optional().describe("The name of the patient's current exercise program."),
  currentProgramAdherence: z.number().min(0).max(100).optional().describe("The patient's overall adherence percentage to the current program."),
  workoutStreak: z.number().min(0).optional().describe("The patient's current workout streak in days."),
  completedExercisesToday: z.boolean().optional().describe("Whether the patient has completed their exercises for the current day."),
  upcomingDifficultExercise: z.string().optional().describe("The name of a potentially challenging or important upcoming exercise."),
  recentFeedbackPainLevel: z.number().min(1).max(10).optional().describe("Pain level from recent feedback (1-10), if available."),
});
export type AiPatientMotivationInput = z.infer<typeof AiPatientMotivationInputSchema>;

const AiPatientMotivationOutputSchema = z.object({
  motivationalMessage: z.string().describe("A personalized motivational message for the patient. Should be 1-2 sentences, encouraging and relevant."),
});
export type AiPatientMotivationOutput = z.infer<typeof AiPatientMotivationOutputSchema>;

export async function generateMotivationalMessage(input: AiPatientMotivationInput): Promise<AiPatientMotivationOutput> {
  return aiPatientMotivatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPatientMotivatorPrompt',
  input: {schema: AiPatientMotivationInputSchema},
  output: {schema: AiPatientMotivationOutputSchema},
  prompt: `You are an encouraging and insightful AI physiotherapy coach for an app called PhysioPro.
Your goal is to provide short, personalized, and positive motivational messages to patients based on their current context.
Keep the message to 1-2 sentences. Be empathetic and understanding.

Patient's Name: {{{patientName}}}

Context:
{{#if currentProgramName}}
- Current Program: {{{currentProgramName}}}
  {{#if currentProgramAdherence}}
  - Adherence: {{{currentProgramAdherence}}}%
  {{/if}}
{{/if}}
{{#if workoutStreak}}
- Current Workout Streak: {{{workoutStreak}}} days
{{/if}}
{{#if completedExercisesToday}}
- Exercises for today: Completed!
{{else}}
- Exercises for today: Not yet completed.
{{/if}}
{{#if upcomingDifficultExercise}}
- Upcoming challenging exercise: {{{upcomingDifficultExercise}}}
{{/if}}
{{#if recentFeedbackPainLevel}}
- Recently reported pain level: {{{recentFeedbackPainLevel}}}/10
{{/if}}

Based on this context, generate a motivational message. Examples:

*   If streak is high: "Amazing {{{workoutStreak}}}-day streak, {{{patientName}}}! Your consistency is paying off."
*   If adherence is good: "Great job staying on track with {{{currentProgramName}}}, {{{patientName}}}! Keep up the fantastic effort."
*   If exercises not done yet: "Ready to tackle your exercises for {{{currentProgramName}}} today, {{{patientName}}}? You've got this!"
*   If exercises done: "Awesome work completing your exercises for today, {{{patientName}}}! Rest up and feel proud."
*   If upcoming difficult exercise: "Remember to focus on your form for {{{upcomingDifficultExercise}}}, {{{patientName}}}. Take it one rep at a time."
*   If recent pain reported and low: "Glad to see your pain level was low recently, {{{patientName}}}. Keep listening to your body."
*   If recent pain reported and high: "Noticed you reported a pain level of {{{recentFeedbackPainLevel}}}/10, {{{patientName}}}. Remember to modify if needed and let your clinician know if it persists."
*   General encouragement: "Every step forward, no matter how small, is progress, {{{patientName}}}!"

Make the message feel personal and relevant.
The output must be in JSON format.
`,
});

const aiPatientMotivatorFlow = ai.defineFlow(
  {
    name: 'aiPatientMotivatorFlow',
    inputSchema: AiPatientMotivationInputSchema,
    outputSchema: AiPatientMotivationOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output || { motivationalMessage: `Keep up the great work, ${input.patientName}!` }; // Fallback
  }
);

