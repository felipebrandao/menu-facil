export type CategoryColorScheme = {
  bar: string;
  label: string;
};

const BLUE: CategoryColorScheme = {
  bar: 'border-l-blue-500 dark:!border-l-blue-500',
  label: 'text-blue-600 dark:text-blue-400'
};

const ORANGE: CategoryColorScheme = {
  bar: 'border-l-orange-500 dark:!border-l-orange-500',
  label: 'text-orange-600 dark:text-orange-400'
};

const VIOLET: CategoryColorScheme = {
  bar: 'border-l-violet-500 dark:!border-l-violet-500',
  label: 'text-violet-600 dark:text-violet-400'
};

const EMERALD: CategoryColorScheme = {
  bar: 'border-l-emerald-500 dark:!border-l-emerald-500',
  label: 'text-emerald-600 dark:text-emerald-400'
};

const ROSE: CategoryColorScheme = {
  bar: 'border-l-rose-500 dark:!border-l-rose-500',
  label: 'text-rose-600 dark:text-rose-400'
};

const CYAN: CategoryColorScheme = {
  bar: 'border-l-cyan-500 dark:!border-l-cyan-500',
  label: 'text-cyan-600 dark:text-cyan-400'
};

const AMBER: CategoryColorScheme = {
  bar: 'border-l-amber-500 dark:!border-l-amber-500',
  label: 'text-amber-600 dark:text-amber-400'
};

const FUCHSIA: CategoryColorScheme = {
  bar: 'border-l-fuchsia-500 dark:!border-l-fuchsia-500',
  label: 'text-fuchsia-600 dark:text-fuchsia-400'
};

const TEAL: CategoryColorScheme = {
  bar: 'border-l-teal-500 dark:!border-l-teal-500',
  label: 'text-teal-600 dark:text-teal-400'
};

const INDIGO: CategoryColorScheme = {
  bar: 'border-l-indigo-500 dark:!border-l-indigo-500',
  label: 'text-indigo-600 dark:text-indigo-400'
};

const FALLBACK: CategoryColorScheme = {
  bar: 'border-l-slate-400 dark:!border-l-slate-400',
  label: 'text-slate-600 dark:text-slate-300'
};

const CATEGORY_COLOR_HINTS: Record<string, CategoryColorScheme> = {
  almoco: BLUE,
  lanche: ORANGE,
  jantar: VIOLET,
  cafe: AMBER,
  cafe_da_manha: AMBER,
  sobremesa: ROSE,
  bebida: CYAN,
  ceia: INDIGO,
  brunch: TEAL,
  snack: ORANGE,
  lunch: BLUE,
  dinner: VIOLET,
  breakfast: AMBER
};

const CATEGORY_COLOR_PALETTE: CategoryColorScheme[] = [
  BLUE,
  ORANGE,
  VIOLET,
  EMERALD,
  ROSE,
  CYAN,
  AMBER,
  FUCHSIA,
  TEAL,
  INDIGO
];

function normalizeCategory(value: string): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function stableHash(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getCategoryColorScheme(category: string): CategoryColorScheme {
  const normalized = normalizeCategory(category);

  if (!normalized) {
    return FALLBACK;
  }

  if (CATEGORY_COLOR_HINTS[normalized]) {
    return CATEGORY_COLOR_HINTS[normalized];
  }

  const compact = normalized.replace(/\s+/g, '_');
  if (CATEGORY_COLOR_HINTS[compact]) {
    return CATEGORY_COLOR_HINTS[compact];
  }

  const index = stableHash(normalized) % CATEGORY_COLOR_PALETTE.length;
  return CATEGORY_COLOR_PALETTE[index] ?? FALLBACK;
}


