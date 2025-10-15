export interface IngredientSuggestion {
  id?: string;
  name: string;
}

export interface RecipeIngredient {
  id?: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface Ingredient {
  id?: string;
  name: string;
  unit: string;
  category: string;
}
