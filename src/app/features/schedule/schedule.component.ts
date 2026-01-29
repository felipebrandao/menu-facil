import {Component, OnInit} from '@angular/core';
import {ScheduleService} from './services/schedule.service';
import {RecipeCategory, RecipeSummary} from '../../shared/models/recipe.model';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ScheduleWeeklyComponent} from './components/schedule-weekly/schedule-weekly.component';
import {ScheduleMonthlyComponent} from './components/schedule-monthly/schedule-monthly.component';
import {RecipeService} from '../../shared/services/recipe.service';
import {RecipeCategoryService} from '../../shared/services/recipe-category.service';
import {Router} from '@angular/router';
import {format, parseISO, isValid} from 'date-fns';
import {ptBR} from 'date-fns/locale';
import {SkeletonComponent} from '../../shared/components/skeleton/skeleton.component';
import {SuccessModalComponent} from '../../shared/components/success-modal/success-modal.component';
import {ErrorModalComponent} from '../../shared/components/error-modal/error-modal.component';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop';

type WeekDaySlot = { date: Date; label: string; short: string; items: RecipeSummary[] };

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ScheduleWeeklyComponent,
    ScheduleMonthlyComponent,
    SkeletonComponent,
    SuccessModalComponent,
    ErrorModalComponent,
    DragDropModule
  ],
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {
  viewMode: 'weekly' | 'monthly' = 'weekly';

  filterQuery = '';
  filterCategoryId = 'Todos';
  categories: RecipeCategory[] = [];

  recipes: RecipeSummary[] = [];

  isLoadingRecipes = false;

  recipesPage = 1;
  recipesLimit = 5;
  recipesTotal = 0;
  recipesTotalPages = 1;

  week: WeekDaySlot[] = [];
  currentDate = new Date();
  weekStart = this.startOfWeek(new Date());
  selectedPeriodLabel = '';

  scheduledMap: Record<string, RecipeSummary[]> = {};
  private scheduledIdsMap: Record<string, string[]> = {};

  isLoadingSchedule = false;

  showRecipeModal = false;
  modalRecipe?: RecipeSummary;
  modalDate = '';

  isAddingRecipe = false;

  showAddedSuccessModal = false;

  private dayLabels = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

  showScheduledModal = false;
  scheduledModalRecipe?: RecipeSummary;
  scheduledModalDateKey?: string;
  scheduledModalItemIndex?: number;

  showErrorModal = false;
  errorMessage = '';
  errorDetails = '';

  isRemovingScheduled = false;
  showRemovedSuccessModal = false;

  selectedMonthlyDateKey?: string;

  get selectedMonthlyItems(): RecipeSummary[] {
    if (!this.selectedMonthlyDateKey) return [];
    return this.scheduledMap?.[this.selectedMonthlyDateKey] ?? [];
  }

  constructor(
    private scheduleService: ScheduleService,
    private recipeService: RecipeService,
    private recipeCategoryService: RecipeCategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadRecipes();
    this.refreshPeriod();
  }

  private loadCategories() {
    this.recipeCategoryService.getAll().subscribe({
      next: (list) => {
        this.categories = (list || []).filter(Boolean);

        const hasSelected = this.filterCategoryId !== 'Todos' && this.categories.some(c => c.id === this.filterCategoryId);
        if (this.filterCategoryId !== 'Todos' && !hasSelected) {
          this.filterCategoryId = 'Todos';
        }
      },
      error: () => {
        this.categories = [];
        this.filterCategoryId = 'Todos';
      }
    });
  }

  private openError(message: string, details = '') {
    this.errorMessage = message;
    this.errorDetails = details;
    this.showErrorModal = true;
  }

  onRetry() {
    this.showErrorModal = false;
    this.refreshPeriod();
  }

  onCancel() {
    this.showErrorModal = false;
  }

  private loadRecipes() {
    this.isLoadingRecipes = true;

    const params: any = {
      page: this.recipesPage,
      limit: this.recipesLimit
    };

    const q = (this.filterQuery || '').trim();
    if (q) params.query = q;

    if (this.filterCategoryId && this.filterCategoryId !== 'Todos') {
      params.categoryId = this.filterCategoryId;
    }

    this.recipeService.getRecipes(params).subscribe({
      next: (resp: any) => {
        const list = Array.isArray(resp?.recipes) ? resp.recipes : [];
        this.recipes = list.map((r: any) => ({
          id: r.id,
          name: r.name,
          category: r.category,
          mainImage: r.mainImage
        })) as RecipeSummary[];

        const p = resp?.pagination || {};
        this.recipesPage = p.page ?? this.recipesPage;
        this.recipesLimit = p.limit ?? this.recipesLimit;
        this.recipesTotal = p.total ?? this.recipesTotal;
        this.recipesTotalPages = p.totalPages ?? Math.max(1, Math.ceil((this.recipesTotal || this.recipes.length) / this.recipesLimit));

        this.isLoadingRecipes = false;
      },
      error: () => {
        this.recipes = [];
        this.recipesTotal = 0;
        this.recipesTotalPages = 1;
        this.isLoadingRecipes = false;
        this.openError('Erro ao carregar receitas', 'Tente novamente.');
      }
    });
  }

  onFilterQueryChange(value: string) {
    this.filterQuery = value;
    this.recipesPage = 1;
    this.loadRecipes();
  }

  onFilterCategoryChange(categoryId: string) {
    this.filterCategoryId = categoryId;
    this.recipesPage = 1;
    this.loadRecipes();
  }

  prevRecipesPage() {
    if (this.recipesPage <= 1 || this.isLoadingRecipes) return;
    this.recipesPage--;
    this.loadRecipes();
  }

  nextRecipesPage() {
    if (this.recipesPage >= this.recipesTotalPages || this.isLoadingRecipes) return;
    this.recipesPage++;
    this.loadRecipes();
  }

  setView(mode: 'weekly' | 'monthly') {
    if (this.viewMode === mode) return;
    this.viewMode = mode;
    this.refreshPeriod();
  }

  prevPeriod() {
    if (this.viewMode === 'weekly') {
      this.weekStart = this.addDays(this.weekStart, -7);
    } else {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    }
    this.refreshPeriod();
  }

  nextPeriod() {
    if (this.viewMode === 'weekly') {
      this.weekStart = this.addDays(this.weekStart, 7);
    } else {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    }
    this.refreshPeriod();
  }

  private refreshPeriod() {
    if (this.viewMode === 'weekly') {
      this.loadWeekly();
      const end = this.addDays(this.weekStart, 6);
      this.selectedPeriodLabel = `${this.formatLabel(this.weekStart)} \u2192 ${this.formatLabel(end)}`;
    } else {
      this.loadMonthly();
      const y = this.currentDate.getFullYear();
      const m = this.currentDate.toLocaleString('pt-BR', {month: 'long'});
      this.selectedPeriodLabel = `${m.charAt(0).toUpperCase() + m.slice(1)} ${y}`;
    }
  }

  private loadWeekly() {
    this.isLoadingSchedule = true;

    const startKey = this.formatKey(this.weekStart);
    this.scheduleService.getWeekly(startKey).subscribe({
      next: resp => {
        this.week = resp.days.map(d => {
          const date = this.parseKey(d.date);
          return {
            date,
            label: this.dayLabels[date.getDay()],
            short: this.toDDMM(date),
            items: (d.recipes || [])
              .map(r => r.recipeSummary!)
              .filter(Boolean)
          };
        });

        this.scheduledIdsMap = {};
        resp.days.forEach(d => {
          this.scheduledIdsMap[d.date] = (d.recipes || []).map(r => r.id);
        });

        this.isLoadingSchedule = false;
      },
      error: () => {
        this.week = [];
        this.scheduledIdsMap = {};
        this.isLoadingSchedule = false;
        this.openError('Erro ao carregar cronograma semanal', 'Tente novamente.');
      }
    });
  }

  private loadMonthly() {
    this.isLoadingSchedule = true;

    const prevSelected = this.selectedMonthlyDateKey;

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth() + 1;
    this.scheduleService.getMonthly(year, month).subscribe({
      next: resp => {
        const map: Record<string, RecipeSummary[]> = {};
        const idsMap: Record<string, string[]> = {};
        resp.days.forEach(d => {
          map[d.date] = (d.recipes || []).map(r => r.recipeSummary!).filter(Boolean);
          idsMap[d.date] = (d.recipes || []).map(r => r.id);
        });
        this.scheduledMap = map;
        this.scheduledIdsMap = idsMap;

        const todayKey = this.formatKey(new Date());
        const todayInThisMonth = new Date().getFullYear() === this.currentDate.getFullYear() && new Date().getMonth() === this.currentDate.getMonth();

        if (prevSelected && this.scheduledMap[prevSelected] !== undefined) {
          this.selectedMonthlyDateKey = prevSelected;
        } else if (todayInThisMonth && this.scheduledMap[todayKey] !== undefined) {
          this.selectedMonthlyDateKey = todayKey;
        } else {
          this.selectedMonthlyDateKey = this.formatKey(new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1));
        }

        this.isLoadingSchedule = false;
      },
      error: () => {
        this.scheduledMap = {};
        this.scheduledIdsMap = {};
        this.isLoadingSchedule = false;
        this.openError('Erro ao carregar cronograma mensal', 'Tente novamente.');
      }
    });
  }

  // Agora a lista já vem filtrada do backend.
  filteredRecipes(): RecipeSummary[] {
    return this.recipes || [];
  }

  openAddRecipeModal(r: RecipeSummary) {
    this.modalRecipe = r;
    this.modalDate = this.formatKey(new Date());
    this.showRecipeModal = true;
  }

  closeAddRecipeModal() {
    if (this.isAddingRecipe) return;
    this.showRecipeModal = false;
    this.modalRecipe = undefined;
  }

  confirmAddFromModal() {
    if (!this.modalRecipe || !this.modalDate || this.isAddingRecipe) return;

    this.isAddingRecipe = true;

    this.scheduleService.addRecipe(this.modalDate, this.modalRecipe.id).subscribe({
      next: () => {
        this.isAddingRecipe = false;
        this.closeAddRecipeModal();
        this.refreshPeriod();
        this.showAddedSuccessModal = true;
      },
      error: () => {
        this.isAddingRecipe = false;
        this.openError('Erro ao adicionar receita no cronograma', 'Por favor, tente novamente.');
      }
    });
  }

  closeAddedSuccessModal() {
    this.showAddedSuccessModal = false;
  }

  addToDay(recipe: RecipeSummary, dayIndex: number) {
    const dateKey = this.formatKey(this.week[dayIndex].date);
    this.scheduleService.addRecipe(dateKey, recipe.id).subscribe({
      next: () => {
        this.loadWeekly();
        this.showAddedSuccessModal = true;
      },
      error: () => this.openError('Erro ao adicionar receita no dia', 'Por favor, tente novamente.')
    });
  }

  addToDate(e: { recipe: RecipeSummary; dateKey: string }) {
    this.scheduleService.addRecipe(e.dateKey, e.recipe.id).subscribe({
      next: () => {
        this.loadMonthly();
        this.showAddedSuccessModal = true;
      },
      error: () => this.openError('Erro ao adicionar receita na data', 'Por favor, tente novamente.')
    });
  }

  private startOfWeek(d: Date): Date {
    const c = new Date(d);
    const day = c.getDay();
    c.setDate(c.getDate() - day);
    c.setHours(0, 0, 0, 0);
    return c;
  }

  private addDays(d: Date, n: number): Date {
    const c = new Date(d);
    c.setDate(c.getDate() + n);
    return c;
  }

  private toDDMM(d: Date): string {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}`;
  }

  private formatKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private parseKey(s: string): Date {
    const [y, m, d] = s.split('-').map(n => parseInt(n, 10));
    return new Date(y, m - 1, d);
  }

  private formatLabel(d: Date): string {
    return `${this.toDDMM(d)}/${d.getFullYear()}`;
  }

  onRemoveFromDate(e: { dateKey: string; itemIndex: number }) {
    const { dateKey, itemIndex } = e;

    const recipe = this.scheduledMap?.[dateKey]?.[itemIndex];
    if (!recipe) return;

    this.scheduledModalDateKey = dateKey;
    this.scheduledModalItemIndex = itemIndex;
    this.scheduledModalRecipe = recipe;
    this.showScheduledModal = true;
  }

  removeFromDay(dayIndex: number, itemIndex: number) {
    const dateKey = this.formatKey(this.week[dayIndex].date);
    const recipe = this.week?.[dayIndex]?.items?.[itemIndex];
    if (!recipe) return;

    this.scheduledModalDateKey = dateKey;
    this.scheduledModalItemIndex = itemIndex;
    this.scheduledModalRecipe = recipe;
    this.showScheduledModal = true;
  }

  confirmRemoveScheduled() {
    const dateKey = this.scheduledModalDateKey;
    const idx = this.scheduledModalItemIndex;

    if (!dateKey || idx === undefined || idx === null) return;

    const scheduledId = this.scheduledIdsMap[dateKey]?.[idx];

    if (!scheduledId) {
      const arr = this.scheduledMap[dateKey] ?? [];
      arr.splice(idx, 1);
      this.scheduledMap = { ...this.scheduledMap, [dateKey]: [...arr] };
      this.isRemovingScheduled = false;
      this.closeScheduledModal();
      this.showRemovedSuccessModal = true;
      return;
    }

    this.isRemovingScheduled = true;

    this.scheduleService.deleteRecipe(scheduledId).subscribe({
      next: () => {
        this.isRemovingScheduled = false;
        this.closeScheduledModal();
        this.refreshPeriod();
        this.showRemovedSuccessModal = true;
      },
      error: () => {
        this.isRemovingScheduled = false;
        this.closeScheduledModal();
        this.refreshPeriod();
        this.openError('Erro ao remover do cronograma', 'Por favor, tente novamente.');
      }
    });
  }

  closeRemovedSuccessModal() {
    this.showRemovedSuccessModal = false;
  }

  onOpenScheduled(e: { dateKey: string; itemIndex: number; recipe: RecipeSummary }) {
    this.scheduledModalDateKey = e.dateKey;
    this.scheduledModalItemIndex = e.itemIndex;
    this.scheduledModalRecipe = e.recipe;
    this.showScheduledModal = true;
  }

  closeScheduledModal() {
    if (this.isRemovingScheduled) return;

    this.showScheduledModal = false;
    this.scheduledModalRecipe = undefined;
    this.scheduledModalDateKey = undefined;
    this.scheduledModalItemIndex = undefined;
  }

  viewRecipeFromModal() {
    const id = this.scheduledModalRecipe?.id;
    if (!id) return;
    this.closeScheduledModal();
    this.router.navigate(['/recipes', id]);
  }

  formatWeekdayDate(d?: Date | string): string {
    if (!d) return '';
    let date: Date;

    if (typeof d === 'string') {
      date = parseISO(d);
      if (!isValid(date)) {
        date = new Date(d);
      }
    } else {
      date = d;
    }

    if (!isValid(date)) return '';
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", {locale: ptBR});
  }

  trackByCategory(_index: number, c: RecipeCategory) {
    return c.id;
  }

  onSelectMonthlyDate(dateKey: string) {
    this.selectedMonthlyDateKey = dateKey;
  }

  formatDDMMYYYY(dateKey?: string): string {
    if (!dateKey) return '';
    const d = this.parseKey(dateKey);
    return this.toDDMM(d) + '/' + d.getFullYear();
  }

  isPastDate(dateKey?: string): boolean {
    if (!dateKey) return true;
    const d = this.parseKey(dateKey);
    d.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d.getTime() < today.getTime();
  }

  monthlyRecipesLabel(count: number): string {
    return `${count} ${count === 1 ? 'receita' : 'receitas'}`;
  }

  private readonly categoryColorPalette = [
    { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-800 dark:text-orange-200', border: 'border-orange-200 dark:border-orange-800/50', hover: 'hover:bg-orange-200 dark:hover:bg-orange-900/60' },
    { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-800 dark:text-red-200', border: 'border-red-200 dark:border-red-800/50', hover: 'hover:bg-red-200 dark:hover:bg-red-900/60' },
    { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-800 dark:text-blue-200', border: 'border-blue-200 dark:border-blue-800/50', hover: 'hover:bg-blue-200 dark:hover:bg-blue-900/60' },
    { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-800 dark:text-purple-200', border: 'border-purple-200 dark:border-purple-800/50', hover: 'hover:bg-purple-200 dark:hover:bg-purple-900/60' },
    { bg: 'bg-pink-100 dark:bg-pink-900/40', text: 'text-pink-800 dark:text-pink-200', border: 'border-pink-200 dark:border-pink-800/50', hover: 'hover:bg-pink-200 dark:hover:bg-pink-900/60' },
    { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-800 dark:text-amber-200', border: 'border-amber-200 dark:border-amber-800/50', hover: 'hover:bg-amber-200 dark:hover:bg-amber-900/60' },
    { bg: 'bg-teal-100 dark:bg-teal-900/40', text: 'text-teal-800 dark:text-teal-200', border: 'border-teal-200 dark:border-teal-800/50', hover: 'hover:bg-teal-200 dark:hover:bg-teal-900/60' },
    { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-800 dark:text-emerald-200', border: 'border-emerald-200 dark:border-emerald-800/50', hover: 'hover:bg-emerald-200 dark:hover:bg-emerald-900/60' },
    { bg: 'bg-cyan-100 dark:bg-cyan-900/40', text: 'text-cyan-800 dark:text-cyan-200', border: 'border-cyan-200 dark:border-cyan-800/50', hover: 'hover:bg-cyan-200 dark:hover:bg-cyan-900/60' },
  ] as const;

  getCategoryColorClasses(category: string): string {
    const color = this.getCategoryColor(category);
    return `${color.bg} ${color.text} ${color.border} ${color.hover}`;
  }

  getCategoryBadgeClasses(category: string): string {
    const color = this.getCategoryColor(category);
    return `${color.bg} ${color.text}`;
  }

  private getCategoryColor(category: string): { bg: string; text: string; border: string; hover: string } {
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
    }
    return this.categoryColorPalette[hash % this.categoryColorPalette.length];
  }

  onReorderDay(event: { dayIndex: number; newOrder: RecipeSummary[] }) {
    const { dayIndex, newOrder } = event;
    const day = this.week[dayIndex];
    if (!day) return;

    const dateKey = this.formatKey(day.date);
    const scheduledIds = this.scheduledIdsMap[dateKey];

    if (!scheduledIds || scheduledIds.length === 0) return;

    const orderedIds = newOrder
      .map(recipe => {
        const index = day.items.findIndex(item => item.id === recipe.id);
        return index >= 0 && index < scheduledIds.length ? scheduledIds[index] : null;
      })
      .filter((id): id is string => id !== null);

    if (orderedIds.length === 0) return;

    day.items = newOrder;

    this.scheduleService.reorder(dateKey, orderedIds).subscribe({
      next: () => {
        this.loadWeekly();
      },
      error: () => {
        this.loadWeekly();
        this.openError('Erro ao reordenar receitas', 'Por favor, tente novamente.');
      }
    });
  }

  onReorderMonthly(event: { dateKey: string; newOrder: RecipeSummary[] }) {
    const { dateKey, newOrder } = event;
    if (!dateKey) return;

    const scheduledIds = this.scheduledIdsMap[dateKey];
    if (!scheduledIds || scheduledIds.length === 0) return;

    const currentArr = this.scheduledMap[dateKey] ?? [];

    const orderedIds = newOrder
      .map(recipe => {
        const index = currentArr.findIndex(item => item.id === recipe.id);
        return index >= 0 && index < scheduledIds.length ? scheduledIds[index] : null;
      })
      .filter((id): id is string => id !== null);

    if (orderedIds.length === 0) return;

    this.scheduledMap = { ...this.scheduledMap, [dateKey]: [...newOrder] };

    this.scheduleService.reorder(dateKey, orderedIds).subscribe({
      next: () => {
        this.loadMonthly();
      },
      error: () => {
        this.loadMonthly();
        this.openError('Erro ao reordenar receitas', 'Por favor, tente novamente.');
      }
    });
  }

  onReorderMonthlyMobile(event: CdkDragDrop<RecipeSummary[]>) {
    if (!this.selectedMonthlyDateKey) return;
    if (event.previousIndex === event.currentIndex) return;

    const items = this.scheduledMap[this.selectedMonthlyDateKey];
    if (!items) return;

    const newItems = [...items];
    const moved = newItems.splice(event.previousIndex, 1)[0];
    newItems.splice(event.currentIndex, 0, moved);

    this.onReorderMonthly({ dateKey: this.selectedMonthlyDateKey, newOrder: newItems });
  }
}
