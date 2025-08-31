'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting recipes based on a list of ingredients.
 *
 * - suggestRecipesFromIngredients - A function that takes a list of ingredients and returns a list of suggested recipes.
 * - SuggestRecipesFromIngredientsInput - The input type for the suggestRecipesFromIngredients function.
 * - SuggestRecipesFromIngredientsOutput - The return type for the suggestRecipesFromIngredients function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRecipesFromIngredientsInputSchema = z.object({
  ingredients: z
    .string()
    .describe('A comma-separated list of ingredients the user has on hand.'),
});
export type SuggestRecipesFromIngredientsInput = z.infer<
  typeof SuggestRecipesFromIngredientsInputSchema
>;

const SuggestRecipesFromIngredientsOutputSchema = z.object({
  recipes: z
    .array(z.string())
    .describe('A list of suggested recipes based on the ingredients.'),
});
export type SuggestRecipesFromIngredientsOutput = z.infer<
  typeof SuggestRecipesFromIngredientsOutputSchema
>;

export async function suggestRecipesFromIngredients(
  input: SuggestRecipesFromIngredientsInput
): Promise<SuggestRecipesFromIngredientsOutput> {
  return suggestRecipesFromIngredientsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRecipesFromIngredientsPrompt',
  input: {schema: SuggestRecipesFromIngredientsInputSchema},
  output: {schema: SuggestRecipesFromIngredientsOutputSchema},
  prompt: `You are a recipe expert. Given the following ingredients, suggest some recipes that can be made with them. Return a list of recipe names.

Ingredients: {{{ingredients}}}`,
});

const suggestRecipesFromIngredientsFlow = ai.defineFlow(
  {
    name: 'suggestRecipesFromIngredientsFlow',
    inputSchema: SuggestRecipesFromIngredientsInputSchema,
    outputSchema: SuggestRecipesFromIngredientsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
