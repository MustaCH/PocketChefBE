// src/ai/flows/filter-recipes.ts
"use server";

/**
 * @fileOverview Filters a list of recipes based on dietary restrictions.
 *
 * - filterRecipes - A function that filters recipes based on dietary restrictions.
 * - FilterRecipesInput - The input type for the filterRecipes function.
 * - FilterRecipesOutput - The return type for the filterRecipes function.
 */

import { ai } from "../ai-instance";
import { z } from "genkit";

const FilterRecipesInputSchema = z.object({
  recipes: z.array(z.string()).describe("A list of recipe suggestions."),
  dietaryRestrictions: z
    .string()
    .describe(
      "Dietary restrictions or preferences (e.g., vegetarian, gluten-free, low carb)."
    ),
});
export type FilterRecipesInput = z.infer<typeof FilterRecipesInputSchema>;

const FilterRecipesOutputSchema = z.object({
  filteredRecipes: z
    .array(z.string())
    .describe("The list of recipes filtered by the dietary restrictions."),
});
export type FilterRecipesOutput = z.infer<typeof FilterRecipesOutputSchema>;

export async function filterRecipes(
  input: FilterRecipesInput
): Promise<FilterRecipesOutput> {
  return filterRecipesFlow(input);
}

const prompt = ai.definePrompt({
  name: "filterRecipesPrompt",
  input: {
    schema: z.object({
      recipes: z.array(z.string()).describe("A list of recipe suggestions."),
      dietaryRestrictions: z
        .string()
        .describe(
          "Dietary restrictions or preferences (e.g., vegetarian, gluten-free, low carb)."
        ),
    }),
  },
  output: {
    schema: z.object({
      filteredRecipes: z
        .array(z.string())
        .describe("The list of recipes filtered by the dietary restrictions."),
    }),
  },
  prompt: `You are a recipe filtering expert. You will receive a list of recipes and a set of dietary restrictions.

You will return a filtered list of recipes that adhere to the dietary restrictions.

Dietary Restrictions: {{{dietaryRestrictions}}}
Recipes: {{#each recipes}}{{{this}}}\n{{/each}}

Filtered Recipes:`, // Ensure Handlebars syntax is correct
});

const filterRecipesFlow = ai.defineFlow<
  typeof FilterRecipesInputSchema,
  typeof FilterRecipesOutputSchema
>(
  {
    name: "filterRecipesFlow",
    inputSchema: FilterRecipesInputSchema,
    outputSchema: FilterRecipesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
