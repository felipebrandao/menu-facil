import { Component, OnInit } from '@angular/core';
import { ScheduleService } from './services/schedule.service';
import { RecipeSummary } from '../../shared/models/recipe.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ScheduleWeeklyComponent} from './components/schedule-weekly/schedule-weekly.component';
import {ScheduleMonthlyComponent} from './components/schedule-monthly/schedule-monthly.component';
import {RecipeService} from '../../shared/services/recipe.service';
import { Router } from '@angular/router';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type WeekDaySlot = { date: Date; label: string; short: string; items: RecipeSummary[] };

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ScheduleWeeklyComponent,
    ScheduleMonthlyComponent
  ],
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {
  viewMode: 'weekly' | 'monthly' = 'weekly';

  filterQuery = '';
  filterCategory = 'Todos';
  categories = ['Todos', 'Café da Manhã', 'Almoço', 'Jantar', 'Lanche', 'Sobremesa'];
  recipes: RecipeSummary[] = [];

  week: WeekDaySlot[] = [];
  currentDate = new Date();
  weekStart = this.startOfWeek(new Date());
  selectedPeriodLabel = '';

  scheduledMap: Record<string, RecipeSummary[]> = {};

  private scheduledIdsMap: Record<string, string[]> = {};

  showRecipeModal = false;
  modalRecipe?: RecipeSummary;
  modalDate = '';

  private dayLabels = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

  showScheduledModal = false;
  scheduledModalRecipe?: RecipeSummary;
  scheduledModalDateKey?: string;
  scheduledModalItemIndex?: number;

  constructor(
    private scheduleService: ScheduleService,
    private recipeService: RecipeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRecipes();
    this.refreshPeriod();
  }

  private loadRecipes() {
    this.recipeService.getRecipes({ limit: 5 }).subscribe({
      next: resp => {
        if (resp && Array.isArray(resp.recipes)) {
          this.recipes = resp.recipes.map(r => ({
            id: r.id,
            name: r.name,
            category: r.category,
            mainImage: r.mainImage
          }));
        } else {
          this.recipes = [];
        }
      },
      error: () => {
        this.recipes = [];
      }
    });
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
      const m = this.currentDate.toLocaleString('pt-BR', { month: 'long' });
      this.selectedPeriodLabel = `${m.charAt(0).toUpperCase() + m.slice(1)} ${y}`;
    }
  }

  private loadWeekly() {
    const startKey = this.formatKey(this.weekStart);
    this.scheduleService.getWeekly(startKey).subscribe(resp => {
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
    });
  }

  private loadMonthly() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth() + 1; // 1-12
    this.scheduleService.getMonthly(year, month).subscribe(resp => {
      const map: Record<string, RecipeSummary[]> = {};
      const idsMap: Record<string, string[]> = {};
      resp.days.forEach(d => {
        map[d.date] = (d.recipes || []).map(r => r.recipeSummary!).filter(Boolean);
        idsMap[d.date] = (d.recipes || []).map(r => r.id);
      });
      this.scheduledMap = map;
      this.scheduledIdsMap = idsMap;
    });
  }

  filteredRecipes(): RecipeSummary[] {
    const q = (this.filterQuery || '').trim().toLowerCase();
    return (this.recipes || []).filter(r =>
      (this.filterCategory === 'Todos' || r.category === this.filterCategory) &&
      (!q || (r.name || '').toLowerCase().includes(q))
    );
  }

  // handlers chamados pelos filhos
  addToDay(recipe: RecipeSummary, dayIndex: number) {
    const dateKey = this.formatKey(this.week[dayIndex].date);
    this.scheduleService.addRecipe(dateKey, recipe.id).subscribe(() => this.loadWeekly());
  }

  addToDate(e: { recipe: RecipeSummary; dateKey: string }) {
    this.scheduleService.addRecipe(e.dateKey, e.recipe.id).subscribe(() => this.loadMonthly());
  }

  removeFromDay(dayIndex: number, itemIndex: number) {
    const dateKey = this.formatKey(this.week[dayIndex].date);
    const ids = this.scheduledIdsMap[dateKey] || [];
    const scheduledId = ids[itemIndex];
    if (!scheduledId) return;
    this.scheduleService.deleteRecipe(scheduledId).subscribe(() => this.loadWeekly());
  }

  openAddRecipeModal(r: RecipeSummary) {
    this.modalRecipe = r;
    this.modalDate = this.formatKey(new Date());
    this.showRecipeModal = true;
  }

  closeAddRecipeModal() {
    this.showRecipeModal = false;
    this.modalRecipe = undefined;
  }

  confirmAddFromModal() {
    if (!this.modalRecipe || !this.modalDate) return;
    this.scheduleService.addRecipe(this.modalDate, this.modalRecipe.id).subscribe(() => {
      this.closeAddRecipeModal();
      this.refreshPeriod();
    });
  }

    // helpers
  private startOfWeek(d: Date): Date {
    const c = new Date(d);
    const day = c.getDay(); // 0..6 (Domingo..Sábado)
    c.setDate(c.getDate() - day); // começa no Domingo
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

    const arr = this.scheduledMap[dateKey] ?? [];
    const removed = arr.splice(itemIndex, 1)[0];

    // Força detecção de mudanças
    this.scheduledMap = { ...this.scheduledMap, [dateKey]: [...arr] };

    // Mantém IDs de agendamento alinhados ao array visual
    const scheduledId = this.scheduledIdsMap[dateKey]?.splice(itemIndex, 1)?.[0];

    // Chama o backend para excluir (se existir ID)
    if (scheduledId) {
      this.scheduleService.deleteRecipe(scheduledId).subscribe({
        next: () => {},
        error: () => {
          // rollback simples em caso de erro
          const rollback = this.scheduledMap[dateKey] ?? [];
          rollback.splice(itemIndex, 0, removed);
          this.scheduledMap = { ...this.scheduledMap, [dateKey]: [...rollback] };
          if (!this.scheduledIdsMap[dateKey]) this.scheduledIdsMap[dateKey] = [];
          this.scheduledIdsMap[dateKey].splice(itemIndex, 0, scheduledId);
        }
      });
    }
  }

  onOpenScheduled(e: { dateKey: string; itemIndex: number; recipe: RecipeSummary }) {
    this.scheduledModalDateKey = e.dateKey;
    this.scheduledModalItemIndex = e.itemIndex;
    this.scheduledModalRecipe = e.recipe;
    this.showScheduledModal = true;
  }

  closeScheduledModal() {
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

  confirmRemoveScheduled() {
    const dateKey = this.scheduledModalDateKey;
    const idx = this.scheduledModalItemIndex;
    if (!dateKey || idx === undefined || idx === null) return;

    const scheduledId = this.scheduledIdsMap[dateKey]?.[idx];
    // se existe id no mapa, chama backend (service) para remover
    if (scheduledId) {
      this.scheduleService.deleteRecipe(scheduledId).subscribe(() => {
        this.closeScheduledModal();
        this.refreshPeriod();
      }, () => {
        this.closeScheduledModal();
        this.refreshPeriod();
      });
    } else {
      // fallback: remove visualmente da scheduledMap e atualiza
      const arr = this.scheduledMap[dateKey] ?? [];
      arr.splice(idx, 1);
      this.scheduledMap = { ...this.scheduledMap, [dateKey]: [...arr] };
      this.closeScheduledModal();
    }
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
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  }
}
