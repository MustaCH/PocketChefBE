// src/ai/flows/generate-recipe-images.ts
"use server";

/**
 * @fileOverview Genera imágenes basadas en el nombre de una receta.
 *
 * - generateRecipeImages - Una función que genera imágenes basadas en el nombre de una receta.
 * - GenerateRecipeImagesInput - El tipo de entrada para la función generateRecipeImages.
 * - GenerateRecipeImagesOutput - El tipo de retorno para la función generateRecipeImages.
 */

import { ai } from "../ai-instance";
import { z } from "genkit";

const GenerateRecipeImagesInputSchema = z.object({
  recipeName: z
    .string()
    .describe("El nombre de la receta para generar la imagen."),
});
export type GenerateRecipeImagesInput = z.infer<
  typeof GenerateRecipeImagesInputSchema
>;

const GenerateRecipeImagesOutputSchema = z.object({
  imageUrl: z.string().describe("La URL de la imagen generada."),
});
export type GenerateRecipeImagesOutput = z.infer<
  typeof GenerateRecipeImagesOutputSchema
>;

export async function generateRecipeImages(
  input: GenerateRecipeImagesInput
): Promise<GenerateRecipeImagesOutput> {
  return generateRecipeImagesFlow(input);
}

const prompt = ai.definePrompt({
  name: "generateRecipeImagesPrompt",
  input: {
    schema: z.object({
      recipeName: z
        .string()
        .describe("El nombre de la receta para generar la imagen."),
    }),
  },
  output: {
    schema: z.object({
      imageUrl: z.string().describe("La URL de la imagen generada."),
    }),
  },
  prompt: `Eres un experto en generación de imágenes realistas de recetas. Recibirás el nombre de una receta y generarás una imagen que represente visualmente la receta.

Nombre de la receta: {{{recipeName}}}

URL de la imagen generada:`,
});

const generateRecipeImagesFlow = ai.defineFlow<
  typeof GenerateRecipeImagesInputSchema,
  typeof GenerateRecipeImagesOutputSchema
>(
  {
    name: "generateRecipeImagesFlow",
    inputSchema: GenerateRecipeImagesInputSchema,
    outputSchema: GenerateRecipeImagesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
