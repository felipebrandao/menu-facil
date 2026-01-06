import {Component, OnInit} from '@angular/core';
import {ScheduleService} from './services/schedule.service';
import {RecipeSummary} from '../../shared/models/recipe.model';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ScheduleWeeklyComponent} from './components/schedule-weekly/schedule-weekly.component';
import {ScheduleMonthlyComponent} from './components/schedule-monthly/schedule-monthly.component';
import {RecipeService} from '../../shared/services/recipe.service';
import {Router} from '@angular/router';
import {format, parseISO, isValid} from 'date-fns';
import {ptBR} from 'date-fns/locale';
import {SkeletonComponent} from '../../shared/components/skeleton/skeleton.component';
import {SuccessModalComponent} from '../../shared/components/success-modal/success-modal.component';
import {ErrorModalComponent} from '../../shared/components/error-modal/error-modal.component';

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
    ErrorModalComponent
  ],
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {
  viewMode: 'weekly' | 'monthly' = 'weekly';

  filterQuery = '';
  filterCategory = 'Todos';
  categories = ['Todos', 'Café da Manhã', 'Almoço', 'Jantar', 'Lanche', 'Sobremesa'];
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

  constructor(
    private scheduleService: ScheduleService,
    private recipeService: RecipeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRecipes();
    this.refreshPeriod();
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

    this.recipeService.getRecipes({
      page: this.recipesPage,
      limit: this.recipesLimit
    }).subscribe({
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

  filteredRecipes(): RecipeSummary[] {
    const q = (this.filterQuery || '').trim().toLowerCase();
    return (this.recipes || []).filter(r =>
      (this.filterCategory === 'Todos' || r.category === this.filterCategory) &&
      (!q || (r.name || '').toLowerCase().includes(q))
    );
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
}
