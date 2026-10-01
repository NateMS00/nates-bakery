import { dataBackend } from "@/lib/backend";

// Reads for the pages, from whichever backend is configured (lib/backend/index.ts).

export const getRecipes = async () => (await dataBackend()).getRecipes();
export const getRecipe = async (id: string) => (await dataBackend()).getRecipe(id);
export const getSharedRecipe = async (token: string) => (await dataBackend()).getSharedRecipe(token);
export const getDrafts = async () => (await dataBackend()).getDrafts();
export const getDraft = async (id: string) => (await dataBackend()).getDraft(id);
