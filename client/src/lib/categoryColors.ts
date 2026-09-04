export type CategoryColor = {
  bg: string
  text: string
  wash: string
  hoverBg: string
}

export const CATEGORY_COLORS: Record<string, CategoryColor> = {
  English: {
    bg: 'bg-red-100 dark:bg-red-500/15',
    text: 'text-red-700 dark:text-red-300',
    hoverBg: 'hover:bg-red-300/10',
    wash: 'bg-red-400/8',
  },
  Math: {
    bg: 'bg-blue-100 dark:bg-blue-500/15',
    text: 'text-blue-700 dark:text-blue-300',
    hoverBg: 'hover:bg-blue-300/10',
    wash: 'bg-blue-400/8',
  },
  Science: {
    bg: 'bg-green-100 dark:bg-green-500/15',
    text: 'text-green-700 dark:text-green-300',
    hoverBg: 'hover:bg-green-300/10',
    wash: 'bg-green-400/8',
  },
  'Social Studies': {
    bg: 'bg-amber-100 dark:bg-amber-500/15',
    text: 'text-amber-700 dark:text-amber-300',
    hoverBg: 'hover:bg-amber-300/10',
    wash: 'bg-amber-400/8',
  },
  'World Language': {
    bg: 'bg-teal-100 dark:bg-teal-500/15',
    text: 'text-teal-700 dark:text-teal-300',
    hoverBg: 'hover:bg-teal-300/10',
    wash: 'bg-teal-400/8',
  },
  CTE: {
    bg: 'bg-fuchsia-100 dark:bg-fuchsia-500/15',
    text: 'text-fuchsia-700 dark:text-fuchsia-300',
    hoverBg: 'hover:bg-fuchsia-300/10',
    wash: 'bg-fuchsia-400/8',
  },
  'Fine Arts': {
    bg: 'bg-pink-100 dark:bg-pink-500/15',
    text: 'text-pink-700 dark:text-pink-300',
    hoverBg: 'hover:bg-pink-300/10',
    wash: 'bg-pink-400/8',
  },
  Athletic: {
    bg: 'bg-cyan-100 dark:bg-cyan-500/15',
    text: 'text-cyan-700 dark:text-cyan-300',
    hoverBg: 'hover:bg-cyan-300/10',
    wash: 'bg-cyan-400/8',
  },
  Elective: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    hoverBg: 'hover:bg-slate-300/10',
    wash: 'bg-slate-400/8',
  },
}

const DEFAULT_CATEGORY_COLOR: CategoryColor = {
  bg: 'bg-slate-100',
  text: 'text-slate-700',
  hoverBg: 'hover:bg-slate-300/10',
  wash: 'bg-slate-400/8',
}

export function getCategoryColor(
  category: string | null | undefined
): CategoryColor {
  if (!category) return DEFAULT_CATEGORY_COLOR
  return CATEGORY_COLORS[category] ?? DEFAULT_CATEGORY_COLOR
}
