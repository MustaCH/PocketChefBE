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

ai.defineHelper("encodeURIComponent", (str: string) => encodeURIComponent(str));

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
  prompt: `Eres un experto en construir URLs para el servicio de generación de imágenes image.pollinations.ai.
Tu tarea es generar una URL que produzca una imagen realista de una receta.
La URL base es "https://image.pollinations.ai/prompt/".

Instrucciones para el texto del prompt de la imagen (la parte que va después de "https://image.pollinations.ai/prompt/"):
1. El texto del prompt debe describir un plato de comida realista y apetitoso.
2. Si el nombre de la receta proporcionado ({{{recipeName}}}) es el nombre de un animal (por ejemplo, "cerdo", "pollo", "vaca", "cordero"), debes transformarlo para que se refiera a la carne del animal. Por ejemplo, si {{{recipeName}}} es "cerdo", el texto del prompt debe ser "carne de cerdo". Si es "pollo", debe ser "carne de pollo".
3. Si el nombre de la receta ya es un plato (por ejemplo, "Paella de Mariscos", "Lomo Saltado"), úsalo directamente.
4. Siempre añade "fotografía de comida realista, primer plano" al final del texto del prompt para asegurar la calidad y estilo de la imagen.
5. El texto completo del prompt (incluyendo la transformación y los añadidos) debe estar correctamente codificado para URL (por ejemplo, espacios reemplazados por %20).

Ejemplos:

Si recipeName es "Pollo al Curry":
El texto del prompt para la imagen sería: "Pollo al Curry fotografía de comida realista, primer plano"
URL de la imagen generada: https://image.pollinations.ai/prompt/Pollo%20al%20Curry%20fotograf%C3%ADa%20de%20comida%20realista%2C%20primer%20plano

Si recipeName es "Cerdo":
El texto del prompt para la imagen sería: "carne de cerdo fotografía de comida realista, primer plano"
URL de la imagen generada: https://image.pollinations.ai/prompt/carne%20de%20cerdo%20fotograf%C3%ADa%20de%20comida%20realista%2C%20primer%20plano

Si recipeName es "Ensalada César":
El texto del prompt para la imagen sería: "Ensalada César fotografía de comida realista, primer plano"
URL de la imagen generada: https://image.pollinations.ai/prompt/Ensalada%20C%C3%A9sar%20fotograf%C3%ADa%20de%20comida%20realista%2C%20primer%20plano

Ahora, para la siguiente receta:
Nombre de la receta: {{{recipeName}}}

Genera la URL de la imagen:
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
