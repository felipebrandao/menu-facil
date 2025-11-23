import {RecipeIngredientResponse} from './ingredient.model';

export interface Recipe {
  id: string;
  name: string;
  category: {
    id: string;
    name: string;
  };
  ingredients: RecipeIngredientResponse[];
  instructions: string[];
  mainImage?: string;
  gallery?: string[];
  totalTime?: number;
  highlighted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// export interface Recipe {
//   id?: string;
//   name: string;
//   category: string;
//   prepTime?: string;
//   cookTime?: string;
//   servings?: number;
//   mainImage?: string;
//   gallery?: string[];
//   instructions: string[];
//   ingredients: RecipeIngredient[];
//   rating?: number;
//   reviews?: Review[];
//   createdAt?: string;
//   updatedAt?: string;
// }


export interface Review {
  user: string;
  avatar?: string;
  rating: number;
  comment?: string;
}

export interface RecipeSummary {
  id: string;
  name?: string;
  category: string;
  mainImage?: string;
  rating?: number;
  totalTime?: string;
  highlighted?: boolean;
  createdAt?: string;
}

export interface RecipeCategory {
  id: string;
  name: string;
}
