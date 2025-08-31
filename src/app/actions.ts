
'use server';

import { suggestRecipesFromIngredients } from '@/ai/flows/suggest-recipes-from-ingredients';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const RecipeDetailsSchema = z.object({
  title: z.string().describe('The title of the recipe.'),
  description: z
    .string()
    .describe('A short, appetizing description of the recipe.'),
  ingredients: z
    .array(z.string())
    .describe('List of all ingredients required for the recipe.'),
  instructions: z
    .array(z.string())
    .describe('Step-by-step instructions for preparing the recipe.'),
  prepTime: z.string().describe('Estimated preparation time.'),
  cookTime: z.string().describe('Estimated cooking time.'),
});

export type RecipeDetails = z.infer<typeof RecipeDetailsSchema>;

export async function getRecipeSuggestions(
  ingredients: string
): Promise<{ suggestions?: string[]; error?: string }> {
  if (!ingredients) {
    return { error: 'Please enter some ingredients.' };
  }

  try {
    const response = await suggestRecipesFromIngredients({ ingredients });
    if (!response.recipes || response.recipes.length === 0) {
      return {
        error:
          'Could not find any recipes with these ingredients. Try different ones!',
      };
    }
    return { suggestions: response.recipes };
  } catch (e) {
    console.error(e);
    return {
      error: 'An error occurred while fetching recipes. Please try again.',
    };
  }
}

export async function getRecipeDetails(
  recipeName: string
): Promise<RecipeDetails | { error: string }> {
  if (!recipeName) {
    return { error: 'Invalid recipe selected.' };
  }

  try {
    const result = await ai.generate({
      prompt: `You are a world-class chef. Generate a recipe for "${recipeName}". You must include a title, a short appetizing description, a list of all ingredients, step-by-step cooking instructions, prep time, and cook time. Ensure instructions are clear and easy to follow.`,
      output: {
        schema: RecipeDetailsSchema,
      },
      temperature: 0.2,
    });

    const recipe = result.output;
    if (!recipe) {
      throw new Error('Failed to generate recipe details.');
    }

    return { ...recipe, title: recipeName };
  } catch (e) {
    console.error(e);
    return {
      error:
        'An error occurred while fetching recipe details. Please try again.',
    };
  }
}
