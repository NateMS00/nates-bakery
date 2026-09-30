import type { Category } from "./types";

// SKELETON: a fixed list, one per recipe, in this order.
export const CATEGORIES: { slug: Category; label: string }[] = [
  { slug: "bread", label: "Bread" },
  { slug: "viennoiserie", label: "Viennoiserie" },
  { slug: "quick-bread", label: "Quick bread" },
  { slug: "cake", label: "Cake" },
  { slug: "cookie-bar", label: "Cookie & bar" },
  { slug: "pie-tart", label: "Pie & tart" },
  { slug: "pastry", label: "Pastry" },
  { slug: "dessert", label: "Dessert" },
  { slug: "other", label: "Other" },
];

export function categoryLabel(slug: Category): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? "Other";
}
