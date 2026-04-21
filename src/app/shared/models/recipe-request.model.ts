export interface RecipeCreateRequest {
  name: string;
  categoryId: string;
  ingredients: RecipeIngredientRequest[];
  instructions: string[];
  mainImage?: string | null;
  mainImagePublicId?: string | null;
  gallery?: string[] | null;
  galleryPublicIds?: string[] | null;
  totalTime?: number;
  highlighted?: boolean;
}

export interface RecipeIngredientRequest {
  ingredientId: string;
  unitId: string;
  quantity: number;
}
