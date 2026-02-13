export const CATEGORIES = [
  { value: 'produce', label: 'Produce', color: 'bg-green-100 text-green-800' },
  { value: 'dairy', label: 'Dairy', color: 'bg-blue-100 text-blue-800' },
  { value: 'meat', label: 'Meat', color: 'bg-red-100 text-red-800' },
  { value: 'bakery', label: 'Bakery', color: 'bg-amber-100 text-amber-800' },
  { value: 'frozen', label: 'Frozen', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'snacks', label: 'Snacks', color: 'bg-orange-100 text-orange-800' },
  { value: 'beverages', label: 'Beverages', color: 'bg-purple-100 text-purple-800' },
  { value: 'household', label: 'Household', color: 'bg-gray-100 text-gray-800' },
  { value: 'other', label: 'Other', color: 'bg-slate-100 text-slate-800' },
] as const

export type CategoryValue = (typeof CATEGORIES)[number]['value']

export function getCategoryInfo(value: string) {
  return CATEGORIES.find((c) => c.value === value) ?? CATEGORIES[CATEGORIES.length - 1]
}
