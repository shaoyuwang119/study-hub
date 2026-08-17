export type CategoryColor = {
  bg: string
  text: string
  accent: string
  wash: string
  hoverBg: string
}

export const CATEGORY_COLORS: Record<string, CategoryColor> = {
  English: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    accent: 'border-l-blue-400',
    wash: 'bg-blue-400/8',
    hoverBg: 'hover:bg-blue-300/10',
  },
  Math: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    accent: 'border-l-purple-400',
    wash: 'bg-purple-400/8',
    hoverBg: 'hover:bg-purple-300/10',
  },
  Science: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    accent: 'border-l-green-400',
    wash: 'bg-green-400/8',
    hoverBg: 'hover:bg-green-300/10',
  },
  'Social Studies': {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    accent: 'border-l-amber-400',
    wash: 'bg-amber-400/8',
    hoverBg: 'hover:bg-amber-300/10',
  },
  'World Language': {
    bg: 'bg-teal-100',
    text: 'text-teal-700',
    accent: 'border-l-teal-400',
    wash: 'bg-teal-400/8',
    hoverBg: 'hover:bg-teal-300/10',
  },
  CTE: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    accent: 'border-l-indigo-400',
    wash: 'bg-indigo-400/8',
    hoverBg: 'hover:bg-indigo-300/10',
  },
  'Fine Arts': {
    bg: 'bg-rose-100',
    text: 'text-rose-700',
    accent: 'border-l-rose-400',
    wash: 'bg-rose-400/8',
    hoverBg: 'hover:bg-rose-300/10',
  },
  Elective: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    accent: 'border-l-orange-400',
    wash: 'bg-orange-400/8',
    hoverBg: 'hover:bg-orange-300/10',
  },
  Athletic: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-700',
    accent: 'border-l-cyan-400',
    wash: 'bg-cyan-400/8',
    hoverBg: 'hover:bg-cyan-300/10',
  },
}

const DEFAULT_CATEGORY_COLOR: CategoryColor = {
  bg: 'bg-slate-100',
  text: 'text-slate-700',
  accent: 'border-l-slate-400',
  wash: 'bg-slate-400/8',
  hoverBg: 'hover:bg-slate-300/10',
}

export function getCategoryColor(
  category: string | null | undefined
): CategoryColor {
  if (!category) return DEFAULT_CATEGORY_COLOR
  return CATEGORY_COLORS[category] ?? DEFAULT_CATEGORY_COLOR
}
