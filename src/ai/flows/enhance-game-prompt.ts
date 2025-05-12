'use server';

/**
 * @fileOverview Enhances the initial game idea prompt to improve the output of the generated game.
 *
 * - enhanceGamePrompt - A function that enhances the game prompt.
 * - EnhanceGamePromptInput - The input type for the enhanceGamePrompt function.
 * - EnhanceGamePromptOutput - The return type for the enhanceGamePrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceGamePromptInputSchema = z.object({
  originalPrompt: z
    .string()
    .describe('The original game idea prompt provided by the user.'),
});
export type EnhanceGamePromptInput = z.infer<typeof EnhanceGamePromptInputSchema>;

const EnhanceGamePromptOutputSchema = z.object({
  enhancedPrompt: z
    .string()
    .describe('The enhanced game idea prompt, refined for better game generation.'),
});
export type EnhanceGamePromptOutput = z.infer<typeof EnhanceGamePromptOutputSchema>;

export async function enhanceGamePrompt(input: EnhanceGamePromptInput): Promise<EnhanceGamePromptOutput> {
  return enhanceGamePromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enhanceGamePromptPrompt',
  input: {schema: EnhanceGamePromptInputSchema},
  output: {schema: EnhanceGamePromptOutputSchema},
  prompt: `You are an expert game designer. Your task is to enhance a user's initial game idea prompt to make it more detailed and creative, ensuring the generated game aligns better with their vision.

Original Prompt: {{{originalPrompt}}}

Enhanced Prompt:`, // Keep it simple and let the LLM generate the enhanced prompt
});

const enhanceGamePromptFlow = ai.defineFlow(
  {
    name: 'enhanceGamePromptFlow',
    inputSchema: EnhanceGamePromptInputSchema,
    outputSchema: EnhanceGamePromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
