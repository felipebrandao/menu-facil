export interface FeaturedRecipe {
  id: string;
  title: string;
  category: string;
  mainImageUrl: string;
  rating: number;
  totalTime: string;
  highlighted: boolean;
}

export interface RecentRecipe {
  id: string;
  name: string;
  category: string;
  createdAt: string;
  mainImageUrl: string;
}

export interface WeeklyScheduleSummary {
  active: boolean;
  startDate?: string;
  endDate?: string;
  scheduleId?: string;
  recipesCount?: number;
  updatedAt?: string;
}

export interface ShoppingListSummary {
  active: boolean;
  listId?: string;
  plannedFor?: string;
  itemsCount?: number;
  status?: string;
}

export interface AvailableStockSummary {
  active: boolean;
  itemsCount?: number;
  lowStockItems?: number;
  lastUpdated?: string;
}

export interface DashboardSummary {
  weeklySchedule: WeeklyScheduleSummary;
  shoppingList: ShoppingListSummary;
  availableStock: AvailableStockSummary;
}
