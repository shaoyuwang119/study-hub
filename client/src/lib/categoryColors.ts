export type CategoryColor = {
  bg: string
  text: string
  accent: string
  wash: string
}

export const CATEGORY_COLORS: Record<string, CategoryColor> = {
  English: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    accent: 'border-l-blue-400',
    wash: 'bg-blue-400/8',
  },
  Math: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    accent: 'border-l-purple-400',
    wash: 'bg-purple-400/8',
  },
  Science: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    accent: 'border-l-green-400',
    wash: 'bg-green-400/8',
  },
  'Social Studies': {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    accent: 'border-l-amber-400',
    wash: 'bg-amber-400/8',
  },
  'Signature Courses': {
    bg: 'bg-pink-100',
    text: 'text-pink-700',
    accent: 'border-l-pink-400',
    wash: 'bg-pink-400/8',
  },
  'World Language': {
    bg: 'bg-teal-100',
    text: 'text-teal-700',
    accent: 'border-l-teal-400',
    wash: 'bg-teal-400/8',
  },
  CTE: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    accent: 'border-l-indigo-400',
    wash: 'bg-indigo-400/8',
  },
  'Fine Arts': {
    bg: 'bg-rose-100',
    text: 'text-rose-700',
    accent: 'border-l-rose-400',
    wash: 'bg-rose-400/8',
  },
  Elective: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    accent: 'border-l-orange-400',
    wash: 'bg-orange-400/8',
  },
  Athletic: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-700',
    accent: 'border-l-cyan-400',
    wash: 'bg-cyan-400/8',
  },
}

const DEFAULT_CATEGORY_COLOR: CategoryColor = {
  bg: 'bg-slate-100',
  text: 'text-slate-700',
  accent: 'border-l-slate-400',
  wash: 'bg-slate-400/8',
}

export function getCategoryColor(
  category: string | null | undefined
): CategoryColor {
  if (!category) return DEFAULT_CATEGORY_COLOR
  return CATEGORY_COLORS[category] ?? DEFAULT_CATEGORY_COLOR
}
