import {RecipeIngredient} from './ingredient.model';

export interface Recipe {
  name: string;
  instructions: string;
  category: string;
  ingredients: RecipeIngredient[];
  mainImage?: string;
  gallery?: string[];
}

export interface CreateRecipeResponse {
  id: string;
  name: string;
  category: string;
  createdAt: string;
}
