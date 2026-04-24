import {
  BriefcaseBusiness,
  CarFront,
  GraduationCap,
  HeartPulse,
  Home,
  MoreHorizontal,
  Popcorn,
  ReceiptText,
  ShoppingBag,
  Utensils
} from "lucide-react";

import type { Category } from "@/features/transactions/types";

export const categoryMeta: Record<
  Category,
  {
    label: string;
    color: string;
    softColor: string;
    chartColor: string;
    icon: typeof Utensils;
  }
> = {
  FOOD: {
    label: "Еда",
    color: "text-emerald-700 dark:text-emerald-300",
    softColor: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800",
    chartColor: "#16a34a",
    icon: Utensils
  },
  TRANSPORT: {
    label: "Транспорт",
    color: "text-sky-700 dark:text-sky-300",
    softColor: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-200 dark:border-sky-800",
    chartColor: "#0284c7",
    icon: CarFront
  },
  HOUSING: {
    label: "Жилье",
    color: "text-stone-700 dark:text-stone-300",
    softColor: "bg-stone-100 text-stone-800 border-stone-200 dark:bg-stone-900 dark:text-stone-200 dark:border-stone-700",
    chartColor: "#78716c",
    icon: Home
  },
  ENTERTAINMENT: {
    label: "Развлечения",
    color: "text-rose-700 dark:text-rose-300",
    softColor: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800",
    chartColor: "#e11d48",
    icon: Popcorn
  },
  HEALTH: {
    label: "Здоровье",
    color: "text-red-700 dark:text-red-300",
    softColor: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800",
    chartColor: "#dc2626",
    icon: HeartPulse
  },
  WORK: {
    label: "Работа",
    color: "text-cyan-700 dark:text-cyan-300",
    softColor: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-200 dark:border-cyan-800",
    chartColor: "#0891b2",
    icon: BriefcaseBusiness
  },
  SUBSCRIPTIONS: {
    label: "Подписки",
    color: "text-indigo-700 dark:text-indigo-300",
    softColor: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-800",
    chartColor: "#4f46e5",
    icon: ReceiptText
  },
  SHOPPING: {
    label: "Шоппинг",
    color: "text-fuchsia-700 dark:text-fuchsia-300",
    softColor: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-950 dark:text-fuchsia-200 dark:border-fuchsia-800",
    chartColor: "#c026d3",
    icon: ShoppingBag
  },
  EDUCATION: {
    label: "Образование",
    color: "text-amber-700 dark:text-amber-300",
    softColor: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
    chartColor: "#d97706",
    icon: GraduationCap
  },
  OTHER: {
    label: "Другое",
    color: "text-zinc-700 dark:text-zinc-300",
    softColor: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-700",
    chartColor: "#71717a",
    icon: MoreHorizontal
  }
};

export function categoryLabel(category: Category) {
  return categoryMeta[category].label;
}
