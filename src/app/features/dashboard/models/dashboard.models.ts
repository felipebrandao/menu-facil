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
