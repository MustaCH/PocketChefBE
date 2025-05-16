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


ai.defineHelper('encodeURIComponent', (str: string) => encodeURIComponent(str));

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
  prompt: `Eres un experto en construir URLs para el servicio de generación de imágenes image.pollinations.ai. Recibirás el nombre de una receta y construirás una URL que genere una imagen realista de esa receta usando el servicio image.pollinations.ai. Asegúrate de que el nombre de la receta esté correctamente codificado para ser parte de una URL (por ejemplo, reemplazando espacios con %20).

Nombre de la receta: {{{recipeName}}}

URL de la imagen generada: https://image.pollinations.ai/prompt/{{{encodeURIComponent recipeName}}}`, 
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
