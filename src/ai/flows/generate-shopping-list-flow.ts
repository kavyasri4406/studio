'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a shopping list.
 *
 * - generateShoppingListFlow - A function that takes available and required ingredients and returns a shopping list.
 * - GenerateShoppingListInput - The input type for the generateShoppingListFlow function.
 * - GenerateShoppingListOutput - The return type for the generateShoppingListFlow function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateShoppingListInputSchema = z.object({
  availableIngredients: z
    .string()
    .describe('A comma-separated list of ingredients the user already has.'),
  requiredIngredients: z
    .array(z.string())
    .describe('A list of all ingredients required for a specific recipe.'),
});
export type GenerateShoppingListInput = z.infer<
  typeof GenerateShoppingListInputSchema
>;

const GenerateShoppingListOutputSchema = z.object({
  shoppingList: z
    .array(z.string())
    .describe(
      'A list of ingredients the user needs to buy. This should only include items from the required ingredients that are not available in the available ingredients list.'
    ),
});
export type GenerateShoppingListOutput = z.infer<
  typeof GenerateShoppingListOutputSchema
>;

export async function generateShoppingList(
  input: GenerateShoppingListInput
): Promise<GenerateShoppingListOutput> {
  return generateShoppingListFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateShoppingListPrompt',
  input: { schema: GenerateShoppingListInputSchema },
  output: { schema: GenerateShoppingListOutputSchema },
  prompt: `You are a helpful kitchen assistant. Your task is to determine which ingredients a user needs to buy for a recipe.

You will be given a list of ingredients the user has on hand and a list of ingredients required for the recipe.

Compare the two lists and identify which of the "required ingredients" are missing from the "available ingredients". Be smart about matching - "tomato" and "tomatoes" are the same thing.

Return a shopping list of the missing ingredients. If all ingredients are available, return an empty list.

Available Ingredients: {{{availableIngredients}}}
Required Ingredients:
{{#each requiredIngredients}}
- {{{this}}}
{{/each}}
`,
});

const generateShoppingListFlow = ai.defineFlow(
  {
    name: 'generateShoppingListFlow',
    inputSchema: GenerateShoppingListInputSchema,
    outputSchema: GenerateShoppingListOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
