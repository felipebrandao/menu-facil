import {RecipeSummary} from '../../../shared/models/recipe.model';

export interface ScheduledRecipe {
  id: string;
  recipeSummary?: RecipeSummary;
  order: number;
  recipeId?: string;
}

export interface ScheduleDay {
  date: string;
  recipes: ScheduledRecipe[];
  hasRecipes?: boolean;
  recipesCount?: number;
}

export interface WeeklyResponse {
  view: 'weekly';
  start: string;
  end: string;
  days: ScheduleDay[];
}

export interface MonthlyResponse {
  view: 'monthly';
  start: string;
  end: string;
  days: ScheduleDay[];
}

export interface DayResponse {
  date: string;
  recipes: Array<{
    id: string;
    summary: RecipeSummary;
    order: number;
  }>;
}
