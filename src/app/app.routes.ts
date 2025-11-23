import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'my-recipes',
    loadComponent: () =>
      import('./features/recipe/pages/my-recipes/my-recipes.component').then(
        (m) => m.MyRecipesComponent
      ),
  },
  {
    path: 'recipes/new',
    loadComponent: () =>
      import('./features/recipe/pages/recipe/recipe.component').then(
        (m) => m.RecipeComponent
      ),
  },
  {
    path: 'recipes/edit/:id',
    loadComponent: () =>
      import('./features/recipe/pages/recipe/recipe.component').then(
        (m) => m.RecipeComponent
      ),
  },
  {
    path: 'recipes/:id',
    loadComponent: () =>
      import('./features/recipe/pages/recipe-view/recipe-view.component').then(
        (m) => m.RecipeViewComponent
      ),
  },
  {
    path: 'schedule',
    loadComponent: () =>
      import('./features/schedule/schedule.component').then(m => m.ScheduleComponent)
  },
  {
    path: "settings/profile",
    loadComponent: () =>
      import("./features/settings/pages/profile/profile.component").then(m => m.ProfileComponent)
  },
  {
    path: 'settings/ingredient-categories',
    loadComponent: () =>
      import('./features/settings/pages/ingredient-categories/ingredient-categories.component').then(
        m => m.IngredientCategoriesComponent
      )
  },
  {
    path: 'settings/units',
    loadComponent: () =>
      import('./features/settings/pages/unit/unit.component').then(
        m => m.UnitComponent
      )
  },
  {
    path: 'settings/ingredients',
    loadComponent: () =>
      import('./features/settings/pages/ingredient-management/ingredient-management.component').then(
        m => m.IngredientManagementComponent
      )
  },
  {
    path: 'settings/recipe-categories',
    loadComponent: () =>
      import('./features/settings/pages/recipe-categories/recipe-categories.component').then(
        m => m.RecipeCategoriesComponent
      )
  },
  { path: '**', redirectTo: 'dashboard' },
];
