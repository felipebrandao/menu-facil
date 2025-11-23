export interface IngredientSuggestion {
  id?: string;
  name: string;
}

export interface RecipeIngredientResponse {
  ingredient: {
    id: string;
    name: string;
    category: {
      id: string;
      name: string;
    };
  };
  unitUsed: {
    id: string;
    name: string;
    abbreviation: string;
  };
  quantity: number;
}

export interface CategoryIngredient {
  id: string;
  name: string;
}

export interface Unit {
  id: string;
  name: string;
  abbreviation: string;
}

export interface IngredientCreateRequest {
  name: string;
  category: { id: string };
  defaultUnit: { id: string };
  conversions: {
    toUnit: { id: string };
    factor: number;
  }[];
}

export interface IngredientResponse {
  id: string;
  name: string;
  category: CategoryIngredient;
  defaultUnit: Unit;
  conversions: {
    toUnit: Unit;
    factor: number;
  }[];
  createdAt: string | null;
}
