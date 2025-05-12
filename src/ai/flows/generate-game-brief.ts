// use server'

/**
 * @fileOverview A flow to generate a brief description of the game, including the rules and how to play.
 *
 * - generateGameBrief - A function that generates the game brief.
 * - GenerateGameBriefInput - The input type for the generateGameBrief function.
 * - GenerateGameBriefOutput - The return type for the generateGameBrief function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateGameBriefInputSchema = z.object({
  gameName: z.string().describe('The name of the game.'),
  gameDescription: z.string().describe('The description of the game.'),
  gameRules: z.string().describe('The rules of the game.'),
});
export type GenerateGameBriefInput = z.infer<typeof GenerateGameBriefInputSchema>;

const GenerateGameBriefOutputSchema = z.object({
  gameBrief: z.string().describe('A brief description of the game, including the rules and how to play.'),
});
export type GenerateGameBriefOutput = z.infer<typeof GenerateGameBriefOutputSchema>;

export async function generateGameBrief(input: GenerateGameBriefInput): Promise<GenerateGameBriefOutput> {
  return generateGameBriefFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGameBriefPrompt',
  input: {schema: GenerateGameBriefInputSchema},
  output: {schema: GenerateGameBriefOutputSchema},
  prompt: `You are an expert game designer. Generate a brief description of the game, including the rules and how to play, so other users can understand the game.\n\nGame Name: {{{gameName}}}\nGame Description: {{{gameDescription}}}\nGame Rules: {{{gameRules}}}`,
});

const generateGameBriefFlow = ai.defineFlow(
  {
    name: 'generateGameBriefFlow',
    inputSchema: GenerateGameBriefInputSchema,
    outputSchema: GenerateGameBriefOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
