
'use server';

/**
 * @fileOverview A program builder AI agent that suggests exercises and parameters based on patient conditions,
 * and can also suggest progressions/regressions for specific exercises or modifications to an entire program.
 *
 * - buildProgram - A function that handles the program building process.
 * - BuildProgramInput - The input type for the buildProgram function.
 * - BuildProgramOutput - The return type for the buildProgram function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProgramExerciseSchemaForInput = z.object({
  exerciseName: z.string(),
  sets: z.string().optional(),
  reps: z.string().optional(),
  duration: z.string().optional(),
});

const BuildProgramInputSchema = z.object({
  patientConditions: z
    .string()
    .optional()
    .describe('The conditions of the patient, e.g., post-ACL surgery knee mobility. Used for initial program suggestion.'),
  exerciseLibrary: z.string().describe('A list of available exercises, semi-colon separated. E.g. Squats;Lunges;Plank. This is always required.'),
  
  exerciseToModify: z.string().optional().describe('The name of a specific exercise to get a progression or regression for.'),
  modificationType: z.enum(['progression', 'regression']).optional().describe("Specify 'progression' or 'regression' if exerciseToModify is provided."),
  
  existingProgramExercises: z.array(ProgramExerciseSchemaForInput).optional().describe("List of exercises currently in the program, if asking for overall modification."),
  newGoalOrFeedback: z.string().optional().describe("New goal for the program or patient feedback to consider for modification, e.g., 'patient reports knee pain during lunges', or 'increase overall endurance'."),
});
export type BuildProgramInput = z.infer<typeof BuildProgramInputSchema>;

const BuildProgramOutputSchema = z.object({
  // For initial program suggestion
  suggestedExercises: z
    .array(z.string())
    .optional()
    .describe('A list of suggested exercise names based on patient conditions, chosen from the provided library.'),
  suggestedParameters: z
    .array(z.string())
    .optional()
    .describe('Suggested parameters (e.g., "Sets: 3, Reps: 10") for each corresponding initial suggested exercise.'),

  // For single exercise progression/regression
  modifiedExerciseSuggestion: z.object({
    exerciseToReplace: z.string().describe("The original exercise name that was to be modified."),
    newExerciseName: z.string().describe("The name of the suggested new exercise (progression/regression) from the library."),
    newParameters: z.string().describe("Suggested parameters for the new exercise."),
    reason: z.string().describe("A brief reason for this suggestion."),
  }).optional().describe("Suggestion for a single exercise progression or regression."),

  // For overall program modification based on goal/feedback
  overallProgramModificationAdvice: z.string().optional().describe("General advice on how to modify the overall program based on the new goal or feedback."),
  exerciseSpecificSuggestions: z.array(z.object({
    exerciseName: z.string().describe("The name of an exercise in the existing program (or a new one to add)."),
    suggestedAction: z.enum(['keep', 'modify_params', 'replace', 'remove', 'add']).describe("Action to take for this exercise."),
    newExerciseName: z.string().optional().describe("If action is 'replace' or 'add', the name of the new exercise from the library."),
    newParameterSuggestion: z.string().optional().describe("If action is 'modify_params' or for a new/replaced exercise, the suggested parameters."),
    reason: z.string().describe("Reason for this specific suggestion."),
  })).optional().describe("Specific suggestions for modifying individual exercises within the program."),
});
export type BuildProgramOutput = z.infer<typeof BuildProgramOutputSchema>;

export async function buildProgram(input: BuildProgramInput): Promise<BuildProgramOutput> {
  return buildProgramFlow(input);
}

const buildProgramPrompt = ai.definePrompt({
  name: 'buildProgramPrompt',
  input: {schema: BuildProgramInputSchema},
  output: {schema: BuildProgramOutputSchema},
  prompt: `You are an AI assistant helping clinicians build and modify personalized exercise programs.
Exercise Library (names are semi-colon separated): {{{exerciseLibrary}}}

Scenario 1: Initial Program Suggestion
If 'patientConditions' is provided and 'exerciseToModify' and 'newGoalOrFeedback' are NOT, suggest 3-5 suitable exercises from the library for the given conditions.
Provide 'suggestedExercises' and 'suggestedParameters'. Parameters should be like "Sets: 3, Reps: 10".

Scenario 2: Exercise Progression/Regression
If 'exerciseToModify' and 'modificationType' are provided:
- Suggest ONE exercise from the library that is a {{{modificationType}}} of '{{{exerciseToModify}}}'.
- Provide 'newExerciseName', 'newParameters' for it, and a 'reason'.
- Ensure 'newExerciseName' is different from '{{{exerciseToModify}}}'.
- The 'exerciseToReplace' in output should be '{{{exerciseToModify}}}'.

Scenario 3: Overall Program Modification
If 'existingProgramExercises' and 'newGoalOrFeedback' are provided:
- Analyze the '{{{newGoalOrFeedback}}}'.
- Provide 'overallProgramModificationAdvice' (1-2 sentences).
- Provide 'exerciseSpecificSuggestions' for exercises in '{{{existingProgramExercises}}}' or suggest new ones to add.
- For each specific suggestion:
    - 'exerciseName': the exercise in the current program, or new exercise name if action is 'add'.
    - 'suggestedAction': can be 'keep', 'modify_params', 'replace', 'remove', 'add'.
    - 'newExerciseName': if replacing or adding, the name from the library.
    - 'newParameterSuggestion': if modifying params or for new/replaced exercise.
    - 'reason': why this change is suggested.
- For 'replace' or 'add', ensure 'newExerciseName' is from the library.

Return output in the specified JSON format.
{{#if patientConditions}}Patient Conditions: {{{patientConditions}}}{{/if}}
{{#if exerciseToModify}}Exercise to Modify: {{{exerciseToModify}}} (Type: {{{modificationType}}}){{/if}}
{{#if existingProgramExercises}}
Existing Program:
{{#each existingProgramExercises}}
- {{{this.exerciseName}}} ({{#if this.sets}}Sets: {{{this.sets}}}{{/if}}{{#if this.reps}}, Reps: {{{this.reps}}}{{/if}}{{#if this.duration}}, Duration: {{{this.duration}}}{{/if}})
{{/each}}
New Goal/Feedback: {{{newGoalOrFeedback}}}
{{/if}}

Ensure all suggested exercise names are strictly from the provided Exercise Library.
If an input combination doesn't match a scenario, respond with a helpful message in 'overallProgramModificationAdvice' if appropriate, or empty fields.
Example format for initial suggestion:
{ "suggestedExercises": ["Squat", "Lunge"], "suggestedParameters": ["Sets: 3, Reps: 12", "Sets: 3, Reps: 10 per leg"] }
Example for progression:
{ "modifiedExerciseSuggestion": { "exerciseToReplace": "Squat", "newExerciseName": "Goblet Squat", "newParameters": "Sets: 3, Reps: 10", "reason": "Increases load and core engagement." } }
Example for program modification:
{ "overallProgramModificationAdvice": "Focus on strengthening quads and glutes, reduce direct knee stress.", "exerciseSpecificSuggestions": [ { "exerciseName": "Lunge", "suggestedAction": "remove", "reason": "Patient reports knee pain." }, { "exerciseName": "Glute Bridge", "suggestedAction": "add", "newExerciseName": "Glute Bridge", "newParameterSuggestion": "Sets: 3, Reps: 15", "reason": "Strengthens glutes with less knee stress." } ] }
`,
});

const buildProgramFlow = ai.defineFlow(
  {
    name: 'buildProgramFlow',
    inputSchema: BuildProgramInputSchema,
    outputSchema: BuildProgramOutputSchema,
  },
  async input => {
    const {output} = await buildProgramPrompt(input);
    return {
        suggestedExercises: output?.suggestedExercises || [],
        suggestedParameters: output?.suggestedParameters || [],
        modifiedExerciseSuggestion: output?.modifiedExerciseSuggestion,
        overallProgramModificationAdvice: output?.overallProgramModificationAdvice,
        exerciseSpecificSuggestions: output?.exerciseSpecificSuggestions || [],
    };
  }
);
