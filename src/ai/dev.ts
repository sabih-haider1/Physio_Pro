
import { config } from 'dotenv';
config();

// All AI flow imports have been removed as their corresponding files are removed.
// This file is kept for potential future use with Genkit dev server,
// but currently registers no flows.
import '@/ai/flows/ai-program-builder';
import '@/ai/flows/ai-exercise-search';
import '@/ai/flows/ai-driven-validation';
import '@/ai/flows/ai-email-generator';
import '@/ai/flows/ai-patient-motivator'; // Added new flow

