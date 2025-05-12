// src/ai/flows/iteratively-improve-game.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for iteratively improving a game based on user requests.
 *
 * - iterativelyImproveGame - A function that takes the current game code and a user request, and returns improved game code.
 * - IterativelyImproveGameInput - The input type for the iterativelyImproveGame function.
 * - IterativelyImproveGameOutput - The return type for the iterativelyImproveGame function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IterativelyImproveGameInputSchema = z.object({
  currentGameCode: z
    .string()
    .describe('The current HTML/CSS/JS code of the game.'),
  userRequest: z.string().describe('The user request for changes or improvements to the game.'),
  gameDescription: z.string().describe('A brief description of the game and how to play it.'),
});
export type IterativelyImproveGameInput = z.infer<typeof IterativelyImproveGameInputSchema>;

const IterativelyImproveGameOutputSchema = z.object({
  improvedGameCode: z.string().describe('The improved HTML/CSS/JS code of the game.'),
  review: z.string().describe('A review of the changes made and any potential issues.'),
  updatedGameDescription: z.string().describe('A updated description of the game and how to play it.'),
});
export type IterativelyImproveGameOutput = z.infer<typeof IterativelyImproveGameOutputSchema>;

export async function iterativelyImproveGame(input: IterativelyImproveGameInput): Promise<IterativelyImproveGameOutput> {
  return iterativelyImproveGameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'iterativelyImproveGamePrompt',
  input: {schema: IterativelyImproveGameInputSchema},
  output: {schema: IterativelyImproveGameOutputSchema},
  prompt: `You are a game developer tasked with improving an existing HTML5 game based on user feedback.

  The current game code is:
  \`\`\`html
  {{{currentGameCode}}}
  \`\`\`

  The user has requested the following changes:
  {{{userRequest}}}

  Here is the current game description:
  {{{gameDescription}}}

  Implement the requested changes, ensuring that the game remains functional and adheres to web standards. Also update the game description with any relevant changes.

  Return the complete, improved HTML/CSS/JS code, a review of the changes made and any potential issues, and the updated game description. Make sure the improved code is complete and runnable.`,
});

const iterativelyImproveGameFlow = ai.defineFlow(
  {
    name: 'iterativelyImproveGameFlow',
    inputSchema: IterativelyImproveGameInputSchema,
    outputSchema: IterativelyImproveGameOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
