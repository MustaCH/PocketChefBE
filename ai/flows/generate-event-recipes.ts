// Use server directive is required for Genkit flows.
"use server";

/**
 * @fileOverview Flow to generate recipes for a special event or occasion.
 *
 * This file defines a Genkit flow that takes event details as input
 * and returns a list of recipe suggestions tailored for that event.
 */

import { ai } from "../ai-instance";
import { z } from "genkit"; // Assuming genkit uses its own z, or it should be 'zod'

// Define the input schema for generating event recipes
const GenerateEventRecipesInputSchema = z.object({
  eventType: z
    .string()
    .describe(
      "The type of event or occasion (e.g., Birthday Party, Anniversary Dinner, Holiday Gathering)."
    ),
  numberOfGuests: z
    .number()
    .int()
    .positive()
    .describe("The number of guests attending the event."),
  mealType: z
    .enum(["starter", "main course", "dessert"])
    .describe(
      "The type of meal to generate recipes for (starter, main course, or dessert)."
    ),
  dietaryRestrictions: z
    .array(z.string())
    .optional()
    .describe(
      "An optional list of dietary restrictions (e.g., vegetarian, gluten-free, nut-free)."
    ),
});
export type GenerateEventRecipesInput = z.infer<
  typeof GenerateEventRecipesInputSchema
>;

// Define the output schema for a single recipe
const EventRecipeSchema = z.object({
  name: z.string().describe("The name of the recipe."),
  description: z
    .string()
    .describe("A brief description of the recipe and why it fits the event."),
  ingredientsRequired: z.array(
    z
      .string()
      .describe(
        "A list of ingredients required for the recipe, including quantity and unit (e.g., '200g flour', '1 unit onion')."
      )
  ),
  instructions: z
    .string()
    .describe("Step-by-step instructions to prepare the recipe."),
  preparationTime: z
    .string()
    .optional()
    .describe("Estimated preparation time."),
  cookingTime: z.string().optional().describe("Estimated cooking time."),
  servings: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe(
      "Number of servings the recipe makes, ideally adjusted for the number of guests."
    ),
  dificulty: z
    .enum(["easy", "medium", "advanced"])
    .optional()
    .describe("Difficulty level: easy, medium, or advanced."),
});

// Define the output schema for the list of event recipes
const GenerateEventRecipesOutputSchema = z.object({
  recipes: z
    .array(EventRecipeSchema)
    .describe("A list of recipes suitable for the specified event."),
});
export type GenerateEventRecipesOutput = z.infer<
  typeof GenerateEventRecipesOutputSchema
>;

// Exported function to call the generateEventRecipesFlow
export async function generateEventRecipes(
  input: GenerateEventRecipesInput
): Promise<GenerateEventRecipesOutput> {
  // Basic validation can be added here if needed, similar to isValidIngredientInput
  // For example, check if eventType is not empty, numberOfGuests is reasonable, etc.
  if (!input.eventType || input.eventType.trim() === "") {
    throw new Error("Por favor, especifica el tipo de evento.");
  }
  if (input.numberOfGuests <= 0) {
    throw new Error("El número de invitados debe ser mayor que cero.");
  }
  return generateEventRecipesFlow(input);
}

// Define the prompt for the AI model
const generateEventRecipesPrompt = ai.definePrompt({
  name: "generateEventRecipesPrompt",
  input: {
    schema: GenerateEventRecipesInputSchema, // Use the existing input schema
  },
  output: {
    schema: GenerateEventRecipesOutputSchema, // Use the existing output schema
  },
  prompt: `You are an expert event culinary planner AI. Given the event details, suggest suitable recipes.

  Event Type: {{eventType}}
  Number of Guests: {{numberOfGuests}}
  Meal Type: {{mealType}}
  {{#if dietaryRestrictions}}
  Dietary Restrictions: {{dietaryRestrictions}}
  {{/if}}

  Return a JSON array of recipes suitable for this event. Each recipe in the array should have:
  - name: The name of the recipe.
  - description: A brief description of why this recipe is suitable for the event and number of guests.
  - ingredientsRequired: A list of all ingredients required, including quantity and unit (e.g., "200g flour", "1 unit onion"). Ensure quantities are appropriately scaled for the {{numberOfGuests}} guests.
  - instructions: Step-by-step instructions for preparing the recipe. Format clearly with numbered steps (e.g., 1. First step, 2. Second step).
  - preparationTime: Estimated preparation time (e.g., "30 minutes").
  - cookingTime: Estimated cooking time (e.g., "1 hour").
  - servings: The number of servings this recipe yields (should match or be easily scalable to {{numberOfGuests}}).
  - dificulty: The difficulty level (easy, medium, or advanced).

  Important: For the step-by-step instructions, follow this format precisely:
  1. First step instruction
  2. Second step instruction
  3. Third step instruction
  
  Ensure the recipes are creative and appropriate for the specified event type and meal type. If dietary restrictions are provided, all suggested recipes MUST adhere to them strictly.`,
});

// Define the Genkit flow
const generateEventRecipesFlow = ai.defineFlow<
  typeof GenerateEventRecipesInputSchema,
  typeof GenerateEventRecipesOutputSchema
>(
  {
    name: "generateEventRecipesFlow",
    inputSchema: GenerateEventRecipesInputSchema,
    outputSchema: GenerateEventRecipesOutputSchema,
  },
  async (input) => {
    const result = await generateEventRecipesPrompt(input);
    return result.output!;
  }
);

// Example usage (for testing purposes, typically you'd call this from another part of your application)
/*
async function testGenerateEventRecipes() {
  try {
    const result = await generateEventRecipes({
      eventType: "Birthday Party",
      numberOfGuests: 12,
      mealType: "main course",
      dietaryRestrictions: ["vegetarian"],
    });
    console.log("Generated Event Recipes:", JSON.stringify(result, null, 2));

    const dessertResult = await generateEventRecipes({
      eventType: "Anniversary Dinner",
      numberOfGuests: 2,
      mealType: "dessert",
      dietaryRestrictions: ["gluten-free"],
    });
    console.log(
      "Generated Dessert Recipes:",
      JSON.stringify(dessertResult, null, 2)
    );
  } catch (error) {
    console.error("Error generating event recipes:", error);
  }
}

testGenerateEventRecipes(); // Uncomment to run the test function directly
*/
