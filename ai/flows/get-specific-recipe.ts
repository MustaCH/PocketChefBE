// Use server directive is required for Genkit flows.
"use server";

/**
 * @fileOverview Flow to get a specific recipe by name.
 *
 * This file defines a Genkit flow that takes a recipe name as input
 * and returns the details of that specific recipe.
 */

import { ai } from "../ai-instance";
import { z } from "genkit";

// Define the input schema for the getSpecificRecipe flow
const GetSpecificRecipeInputSchema = z.object({
  recipeName: z.string().describe("The name of the recipe to find."),
});
export type GetSpecificRecipeInput = z.infer<
  typeof GetSpecificRecipeInputSchema
>;

// Define the output schema for a single recipe
const SpecificRecipeOutputSchema = z.object({
  name: z.string().describe("The name of the recipe."),
  ingredientsRequired: z.array(
    z
      .string()
      .describe(
        "A list of ingredients required for the recipe, including quantity and unit (e.g., '200g flour', '1 unit onion')."
      )
  ),
  instructions: z
    .string()
    .describe("Step-by-step instructions for the recipe."),
  availableIngredientsUsed: z
    .array(z.string())
    .describe(
      "This field can be an empty array [] as we are not starting from a list of available ingredients."
    ),
  dificulty: z
    .string() // In generate-recipes.ts it's enum, but string is more flexible if AI returns variations
    .describe("Difficulty level: easy, medium, or advanced."),
  estimatedTime: z
    .string() // In generate-recipes.ts it's number, string allows for "30 minutes"
    .describe('Estimated elaboration minutes (e.g., "30 minutes").'),
});
export type SpecificRecipeOutput = z.infer<typeof SpecificRecipeOutputSchema>;

// Exported function to call the getSpecificRecipeFlow
export async function getSpecificRecipe(
  input: GetSpecificRecipeInput
): Promise<SpecificRecipeOutput> {
  // Optional: Add validation for recipeName if needed, similar to isValidIngredientInput
  if (!input.recipeName || input.recipeName.trim().length < 3) {
    // Return a structured error matching the output schema
    return {
      name: `Error: Recipe name must be at least 3 characters long.`,
      ingredientsRequired: [],
      instructions: "",
      availableIngredientsUsed: [],
      dificulty: "",
      estimatedTime: "",
    };
  }
  return getSpecificRecipeFlow(input);
}

// Define the prompt for the AI model
const getSpecificRecipePrompt = ai.definePrompt({
  name: "getSpecificRecipePrompt",
  input: {
    schema: GetSpecificRecipeInputSchema,
  },
  output: {
    schema: SpecificRecipeOutputSchema,
  },
  prompt: `You are a recipe providing AI. You will be given the name of a specific recipe. Your task is to provide the details for that exact recipe.

Recipe Name:
{{recipeName}}

Return a JSON object for the recipe with the following details:
- name: The name of the recipe (should match the input Recipe Name).
- ingredientsRequired: A list of ingredients required for the recipe, where each ingredient specifies its name, quantity, and unit (e.g., "Tomatoes: 2 units", "Flour: 100 grams"). Use unit counts for countable items (e.g., eggs, whole fruits) and grams for ingredients like flour or sugar.
- instructions: Step-by-step instructions for the recipe.
- availableIngredientsUsed: This field MUST be an empty array [].
- dificulty: Difficulty level (easy, medium, or advanced).
- estimatedTime: Estimated elaboration minutes (e.g., "30 minutes").

Important: For the step-by-step instructions, follow this format precisely:
1. First step instruction\n\n2. Second step instruction\n\n3. Third step instruction\n
Include any blank lines between steps. This format is essential for proper display.

If you cannot find the specific recipe '{{recipeName}}', respond with a JSON object where the 'name' field indicates the error, for example: { "name": "Error: Recipe '{{recipeName}}' not found", "ingredientsRequired": [], "instructions": "", "availableIngredientsUsed": [], "dificulty": "", "estimatedTime": "" }
`,
});

// Define the Genkit flow
const getSpecificRecipeFlow = ai.defineFlow<
  typeof GetSpecificRecipeInputSchema,
  typeof SpecificRecipeOutputSchema
>(
  {
    name: "getSpecificRecipeFlow",
    inputSchema: GetSpecificRecipeInputSchema,
    outputSchema: SpecificRecipeOutputSchema,
  },
  async (input) => {
    // In generate-recipes.ts, the prompt itself is called as a function.
    // Let's try to replicate that if `ai.definePrompt` returns a callable prompt.
    // If not, we use `generate` as before.
    try {
      const llmResponse = await getSpecificRecipePrompt(input, {
        config: { temperature: 0.3 },
      });
      // Following the pattern from generate-recipes.ts
      const output = llmResponse.output!;
      if (output) {
        return output;
      }
      // This case should ideally not be reached if output! is correctly typed and the LLM behaves as expected.
      // However, as a fallback, we can throw an error or return a structured error.
      console.error("LLM response output was null or undefined.");
      return {
        name: `Error: No valid output from LLM for '${input.recipeName}'.`,
        ingredientsRequired: [],
        instructions: "",
        availableIngredientsUsed: [],
        dificulty: "",
        estimatedTime: "",
      };
    } catch (error) {
      console.error("Error calling getSpecificRecipePrompt:", error);
      // Fallback or more specific error handling
      return {
        name: `Error: Could not generate recipe for '${input.recipeName}' due to an internal error.`,
        ingredientsRequired: [],
        instructions: "",
        availableIngredientsUsed: [],
        dificulty: "",
        estimatedTime: "",
      };
    }
  }
);
