import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { generateRecipes } from "./ai/flows/generate-recipes";
import { filterRecipes } from "./ai/flows/filter-recipes";
import { generateRecipeImages } from "./ai/flows/generate-recipe-images";

// Cargar variables de entorno
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint para generar recetas
app.post("/api/generate-recipes", async (req, res) => {
  try {
    const result = await generateRecipes(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Endpoint para filtrar recetas
app.post("/api/filter-recipes", async (req, res) => {
  try {
    const result = await filterRecipes(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/generate-recipe-images", async (req, res) => {
  try {
    const result = await generateRecipeImages(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor PocketChefBE escuchando en puerto ${PORT}`);
});
