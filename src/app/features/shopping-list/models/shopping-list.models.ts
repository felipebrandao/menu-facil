export type ShoppingListView = 'weekly' | 'monthly';

export type ShoppingListItemResponse = {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unitId: string;
  unitName: string;
  unitAbbreviation: string;
};

export type ShoppingListCategoryResponse = {
  categoryId: string;
  categoryName: string;
  items: ShoppingListItemResponse[];
};

export type ShoppingListRecipeResponse = {
  recipeId: string;
  recipeName: string;
  occurrences: number;
};

export type ShoppingListResponse = {
  view: string;
  start: string; // ISO date
  end: string; // ISO date
  recipes: ShoppingListRecipeResponse[];
  categories: ShoppingListCategoryResponse[];
};

