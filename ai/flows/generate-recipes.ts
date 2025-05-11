// Use server directive is required for Genkit flows.
"use server";

/**
 * @fileOverview Recipe generation flow based on available ingredients.
 *
 * This file defines a Genkit flow that takes a list of ingredients as input
 * and returns a list of recipe suggestions. It includes the input and output
 * schema definitions, the flow definition, and an exported function to call the flow.
 *
 * @remarks
 *  - generateRecipes - A function that handles the recipe generation process.
 *  - GenerateRecipesInput - The input type for the generateRecipes function.
 *  - GenerateRecipesOutput - The return type for the generateRecipes function.
 */

import { ai } from "../ai-instance";
import { z } from "genkit";

// Define the input schema for the generateRecipes function
const GenerateRecipesInputSchema = z.object({
  ingredients: z
    .string()
    .describe("A comma-separated list of ingredients available in the fridge."),
  dietaryRestrictions: z
    .string()
    .optional()
    .describe(
      "Optional dietary restrictions or preferences (e.g., vegetarian, gluten-free)."
    ),
});
export type GenerateRecipesInput = z.infer<typeof GenerateRecipesInputSchema>;

// Define the output schema for the generateRecipes function
const GenerateRecipesOutputSchema = z.object({
  recipes: z
    .array(
      z.object({
        name: z.string().describe("The name of the recipe."),
        ingredientsRequired: z.array(
          z.string().describe("A list of ingredients required for the recipe.")
        ),
        instructions: z
          .string()
          .describe("Step-by-step instructions for the recipe."),
        availableIngredientsUsed: z
          .array(z.string())
          .describe("Ingredients from the input that are used in this recipe."),
        dificulty: z
          .enum(["easy", "medium", "advanced"])
          .describe("Dificulty level: easy, medium o advanced."),
        estimatedTime: z
          .number()
          .int()
          .positive()
          .describe("Estimated elaboration time."),
      })
    )
    .describe("A list of recipe suggestions based on the input ingredients."),
});
export type GenerateRecipesOutput = z.infer<typeof GenerateRecipesOutputSchema>;

// Exported function to call the generateRecipesFlow
function isValidIngredientInput(input: string): boolean {
  // Divide por comas, limpia espacios y filtra términos vacíos
  const items = input
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  // Considera válido si hay al menos un término que sea solo letras y espacios, y longitud > 2
  const plausible = items.filter(
    (item) => /^[a-záéíóúñü\s]+$/i.test(item) && item.length > 2
  );
  return plausible.length > 0;
}

export async function generateRecipes(
  input: GenerateRecipesInput
): Promise<GenerateRecipesOutput> {
  if (!isValidIngredientInput(input.ingredients)) {
    throw new Error(
      "Por favor, ingresa sólo ingredientes de comida separados por comas. Ejemplo: tomate, arroz, pollo"
    );
  }
  return generateRecipesFlow(input);
}

// Define the prompt for the AI model
const generateRecipesPrompt = ai.definePrompt({
  name: "generateRecipesPrompt",
  input: {
    schema: z.object({
      ingredients: z
        .string()
        .describe(
          "A comma-separated list of ingredients available in the fridge."
        ),
      dietaryRestrictions: z
        .string()
        .optional()
        .describe(
          "Optional dietary restrictions or preferences (e.g., vegetarian, gluten-free)."
        ),
    }),
  },
  output: {
    schema: z.object({
      recipes: z
        .array(
          z.object({
            name: z.string().describe("The name of the recipe."),
            ingredientsRequired: z.array(
              z
                .string()
                .describe("A list of ingredients required for the recipe.")
            ),
            instructions: z
              .string()
              .transform((val) => {
                return (
                  val
                    .split(/(\d+\.) /)
                    .map((item, index) =>
                      index % 2 === 1 ? `<b>${item}</b>` : item
                    )
                    .join("") + "<br/>"
                );
              })
              .transform((val) => val.replace(/\n/g, "<br/>"))
              .describe("Step-by-step instructions for the recipe."),
            availableIngredientsUsed: z
              .array(z.string())
              .describe(
                "Ingredients from the input that are used in this recipe."
              ),
            dificulty: z
              .enum(["easy", "medium", "advanced"])
              .describe("Dificulty level: easy, medium o advanced."),
            estimatedTime: z
              .number()
              .int()
              .positive()
              .describe("Estimated elaboration time."),
          })
        )
        .describe(
          "A list of recipe suggestions based on the input ingredients."
        ),
    }),
  },
  prompt: `You are a recipe suggestion AI. ONLY respond to requests that contain a list of food ingredients separated by commas. If the input does not look like a list of food ingredients (for example, if it contains objects, requests for jokes, poems, or anything not related to food), respond with the following JSON:\n\n  { "error": "Input must be a list of food ingredients separated by commas." }\n\n  Given the ingredients a user has on hand, suggest recipes they can make.\n\n  Ingredients:\n  {{ingredients}}\n\n  {{#if dietaryRestrictions}}\n  Dietary Restrictions:\n  {{dietaryRestrictions}}\n  {{/if}}\n\n  Return a JSON array of recipes that can be made using the available ingredients, highlighting which of the provided ingredients are used in each recipe. Each recipe in the array should have:\n  - name\n  - a list of ingredients required\n  - step-by-step instructions\n  - a list of available ingredients that were used from the input\n  - dificulty (dificulty level: easy, medium o advanced)\n  - estimatedTime (estimated elaboration minutes)\n\n  Important: For the step-by-step instructions, follow this format precisely:\n  1. First step instruction\n  2. Second step instruction\n  3. Third step instruction\n  \n  Include any blank lines between steps. This format is essential for proper display.`,
});

// Define the Genkit flow
const generateRecipesFlow = ai.defineFlow<
  typeof GenerateRecipesInputSchema,
  typeof GenerateRecipesOutputSchema
>(
  {
    name: "generateRecipesFlow",
    inputSchema: GenerateRecipesInputSchema,
    outputSchema: GenerateRecipesOutputSchema,
  },
  async (input) => {
    const result = await generateRecipesPrompt(input);
    return result.output!;
  }
);
