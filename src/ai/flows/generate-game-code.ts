'use server';

/**
 * @fileOverview This file defines the generateGameCode flow, which takes a game idea as input,
 * enhances the prompt, generates HTML, CSS, and JavaScript code for the game,
 * and returns the generated code.
 *
 * @exports generateGameCode - The main function to trigger the game code generation flow.
 * @exports GenerateGameCodeInput - The input type for the generateGameCode function.
 * @exports GenerateGameCodeOutput - The output type for the generateGameCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateGameCodeInputSchema = z.object({
  gameIdea: z.string().describe('A description of the game idea.'),
});
export type GenerateGameCodeInput = z.infer<typeof GenerateGameCodeInputSchema>;

const GenerateGameCodeOutputSchema = z.object({
  htmlCode: z.string().describe('The HTML code for the game.'),
  cssCode: z.string().describe('The CSS code for the game.'),
  jsCode: z.string().describe('The JavaScript code for the game.'),
  gameDescription: z.string().describe('A brief description of the game and how to play.'),
});
export type GenerateGameCodeOutput = z.infer<typeof GenerateGameCodeOutputSchema>;

export async function generateGameCode(input: GenerateGameCodeInput): Promise<GenerateGameCodeOutput> {
  return generateGameCodeFlow(input);
}

const generateGameCodePrompt = ai.definePrompt({
  name: 'generateGameCodePrompt',
  input: {schema: GenerateGameCodeInputSchema},
  output: {schema: GenerateGameCodeOutputSchema},
  prompt: `You are a game developer AI.  You take a game idea and generate the HTML, CSS, and JavaScript code for it.

  The game idea is: {{{gameIdea}}}

  You will also generate a brief description of the game and how to play it.

  Ensure the HTML includes all necessary elements, the CSS styles them appropriately, and the JavaScript provides the game logic.
  The game should be playable in a web browser. Return the code and description in the appropriate fields.
  Keep code concise and well-commented.
  `,
});

const generateGameCodeFlow = ai.defineFlow(
  {
    name: 'generateGameCodeFlow',
    inputSchema: GenerateGameCodeInputSchema,
    outputSchema: GenerateGameCodeOutputSchema,
  },
  async input => {
    const {output} = await generateGameCodePrompt(input);
    return output!;
  }
);
