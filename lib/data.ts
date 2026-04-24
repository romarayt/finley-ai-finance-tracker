import {
  differenceInCalendarDays,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  parseISO,
  startOfMonth,
  subDays
} from "date-fns";

import { categoryLabel, categoryMeta } from "@/features/transactions/categories";
import {
  categorySchema,
  settingsSchema,
  transactionInputSchema,
  transactionTypeSchema,
  type Category,
  type Currency,
  type SettingsDTO,
  type SettingsInput,
  type TransactionDTO,
  type TransactionInput,
  type TransactionType
} from "@/features/transactions/types";
import { prisma } from "@/lib/prisma";
import { buildSeedTransactions } from "@/lib/seed-fixtures";

type BudgetStatus = "success" | "warning" | "danger";

export interface CategoryTotal {
  category: Category;
  label: string;
  total: number;
  color: string;
}

export interface DailyPoint {
  date: string;
  income: number;
  expense: number;
}

export interface DashboardData {
  settings: SettingsDTO;
  transactionCount: number;
  budget: {
    total: number;
    spent: number;
    remaining: number;
    percent: number;
    daysLeft: number;
    status: BudgetStatus;
  };
  totals: {
    income: number;
    expense: number;
    balance: number;
  };
  categoryTotals: CategoryTotal[];
  topCategories: CategoryTotal[];
  averageReceipt: {
    amount: number;
    trendPercent: number;
  };
  latest: TransactionDTO[];
  dailySeries: DailyPoint[];
}

export interface InsightAggregate {
  transactionCount: number;
  monthlyBudget: number;
  spentPercent: number;
  totalExpense: number;
  totalIncome: number;
  categoryTotals: CategoryTotal[];
  subscriptions: TransactionDTO[];
  coffeeTotal: number;
  weekdayAverage: number;
  weekendAverage: number;
  largestTransactions: TransactionDTO[];
}

interface DbTransaction {
  id: string;
  amount: number;
  currency: string;
  category: string;
  description: string;
  occurredAt: Date;
  type: string;
  sourceText: string | null;
  confidence: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface MemoryCorrection {
  id: string;
  transactionId?: string;
  sourceText?: string;
  originalAmount?: number;
  correctedAmount?: number;
  originalCategory?: Category;
  correctedCategory?: Category;
  originalDescription?: string;
  correctedDescription?: string;
  createdAt: string;
}

interface MemoryStore {
  settings: SettingsDTO;
  transactions: TransactionDTO[];
  corrections: MemoryCorrection[];
}

const globalForStore = globalThis as unknown as {
  finleyStore?: MemoryStore;
};

function getMemoryStore() {
  if (!globalForStore.finleyStore) {
    globalForStore.finleyStore = {
      settings: {
        monthlyBudget: 80000,
        currency: "RUB",
        theme: "system"
      },
      transactions: buildSeedTransactions(),
      corrections: []
    };
  }

  return globalForStore.finleyStore;
}

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

async function withDatabase<T>(operation: () => Promise<T>, fallback: () => T | Promise<T>) {
  if (!hasDatabase()) {
    return fallback();
  }

  try {
    return await operation();
  } catch (error) {
    console.error("Finley data fallback:", error);
    return fallback();
  }
}

function normalizeCategory(value: string): Category {
  const parsed = categorySchema.safeParse(value);
  return parsed.success ? parsed.data : "OTHER";
}

function normalizeType(value: string): TransactionType {
  const parsed = transactionTypeSchema.safeParse(value);
  return parsed.success ? parsed.data : "EXPENSE";
}

function normalizeCurrency(value: string): Currency {
  return value === "USD" || value === "EUR" ? value : "RUB";
}

function toTransactionDTO(transaction: DbTransaction): TransactionDTO {
  return {
    id: transaction.id,
    amount: transaction.amount,
    currency: normalizeCurrency(transaction.currency),
    category: normalizeCategory(transaction.category),
    description: transaction.description,
    date: transaction.occurredAt.toISOString(),
    type: normalizeType(transaction.type),
    sourceText: transaction.sourceText,
    confidence: transaction.confidence,
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString()
  };
}

function parseDate(value: string) {
  const parsed = value.includes("T") ? parseISO(value) : new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function sortTransactions(transactions: TransactionDTO[]) {
  return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function shouldLogCorrection(input: TransactionInput) {
  if (!input.aiDraft) {
    return false;
  }

  return (
    (typeof input.aiDraft.amount === "number" && input.aiDraft.amount !== input.amount) ||
    (input.aiDraft.category !== undefined && input.aiDraft.category !== input.category) ||
    (input.aiDraft.description !== undefined && input.aiDraft.description !== input.description)
  );
}

async function logCorrection(transactionId: string, input: TransactionInput) {
  if (!shouldLogCorrection(input) || !input.aiDraft) {
    return;
  }

  await withDatabase(
    async () => {
      await prisma.correction.create({
        data: {
          transactionId,
          sourceText: input.sourceText,
          originalAmount: input.aiDraft?.amount,
          correctedAmount: input.amount,
          originalCategory: input.aiDraft?.category,
          correctedCategory: input.category,
          originalDescription: input.aiDraft?.description,
          correctedDescription: input.description
        }
      });
    },
    () => {
      const store = getMemoryStore();
      store.corrections.push({
        id: `correction-${Date.now()}`,
        transactionId,
        sourceText: input.sourceText,
        originalAmount: input.aiDraft?.amount,
        correctedAmount: input.amount,
        originalCategory: input.aiDraft?.category,
        correctedCategory: input.category,
        originalDescription: input.aiDraft?.description,
        correctedDescription: input.description,
        createdAt: new Date().toISOString()
      });
    }
  );
}

export async function getSettings(): Promise<SettingsDTO> {
  return withDatabase(
    async () => {
      const settings = await prisma.settings.upsert({
        where: { id: "default" },
        update: {},
        create: {
          id: "default",
          monthlyBudget: 80000,
          currency: "RUB",
          theme: "system"
        }
      });

      return {
        monthlyBudget: settings.monthlyBudget,
        currency: normalizeCurrency(settings.currency),
        theme: settings.theme === "light" || settings.theme === "dark" ? settings.theme : "system"
      };
    },
    () => getMemoryStore().settings
  );
}

export async function updateSettings(input: SettingsInput): Promise<SettingsDTO> {
  const parsed = settingsSchema.parse(input);

  return withDatabase(
    async () => {
      const settings = await prisma.settings.upsert({
        where: { id: "default" },
        update: parsed,
        create: {
          id: "default",
          ...parsed
        }
      });

      return {
        monthlyBudget: settings.monthlyBudget,
        currency: normalizeCurrency(settings.currency),
        theme: settings.theme === "light" || settings.theme === "dark" ? settings.theme : "system"
      };
    },
    () => {
      const store = getMemoryStore();
      store.settings = parsed;
      return store.settings;
    }
  );
}

export async function listTransactions(): Promise<TransactionDTO[]> {
  return withDatabase(
    async () => {
      const transactions = await prisma.transaction.findMany({
        orderBy: { occurredAt: "desc" }
      });
      return transactions.map(toTransactionDTO);
    },
    () => sortTransactions(getMemoryStore().transactions)
  );
}

export async function createTransaction(input: TransactionInput): Promise<TransactionDTO> {
  const parsed = transactionInputSchema.parse(input);
  const occurredAt = parseDate(parsed.date);

  const transaction = await withDatabase(
    async () => {
      const created = await prisma.transaction.create({
        data: {
          amount: parsed.amount,
          currency: parsed.currency,
          category: parsed.category,
          description: parsed.description,
          occurredAt,
          type: parsed.type,
          sourceText: parsed.sourceText,
          confidence: parsed.confidence
        }
      });
      return toTransactionDTO(created);
    },
    () => {
      const now = new Date().toISOString();
      const created: TransactionDTO = {
        id: `local-${Date.now()}`,
        amount: parsed.amount,
        currency: parsed.currency,
        category: parsed.category,
        description: parsed.description,
        date: occurredAt.toISOString(),
        type: parsed.type,
        sourceText: parsed.sourceText,
        confidence: parsed.confidence,
        createdAt: now,
        updatedAt: now
      };
      const store = getMemoryStore();
      store.transactions = sortTransactions([created, ...store.transactions]);
      return created;
    }
  );

  await logCorrection(transaction.id, parsed);
  return transaction;
}

export async function updateTransaction(
  id: string,
  patch: Partial<Omit<TransactionInput, "aiDraft" | "sourceText">>
): Promise<TransactionDTO | null> {
  return withDatabase(
    async () => {
      const updated = await prisma.transaction.update({
        where: { id },
        data: {
          amount: patch.amount,
          currency: patch.currency,
          category: patch.category,
          description: patch.description,
          occurredAt: patch.date ? parseDate(patch.date) : undefined,
          type: patch.type,
          confidence: patch.confidence
        }
      });
      return toTransactionDTO(updated);
    },
    () => {
      const store = getMemoryStore();
      const index = store.transactions.findIndex((transaction) => transaction.id === id);
      if (index === -1) {
        return null;
      }
      const current = store.transactions[index];
      const updated: TransactionDTO = {
        ...current,
        amount: patch.amount ?? current.amount,
        currency: patch.currency ?? current.currency,
        category: patch.category ?? current.category,
        description: patch.description ?? current.description,
        date: patch.date ? parseDate(patch.date).toISOString() : current.date,
        type: patch.type ?? current.type,
        confidence: patch.confidence ?? current.confidence,
        updatedAt: new Date().toISOString()
      };
      store.transactions[index] = updated;
      store.transactions = sortTransactions(store.transactions);
      return updated;
    }
  );
}

export async function deleteTransaction(id: string) {
  return withDatabase(
    async () => {
      await prisma.transaction.delete({ where: { id } });
      return true;
    },
    () => {
      const store = getMemoryStore();
      const before = store.transactions.length;
      store.transactions = store.transactions.filter((transaction) => transaction.id !== id);
      return store.transactions.length !== before;
    }
  );
}

export async function clearAllTransactions() {
  return withDatabase(
    async () => {
      const result = await prisma.transaction.deleteMany();
      return result.count;
    },
    () => {
      const store = getMemoryStore();
      const count = store.transactions.length;
      store.transactions = [];
      return count;
    }
  );
}

function isInRange(date: Date, start: Date, end: Date) {
  return (isAfter(date, start) || date.getTime() === start.getTime()) && (isBefore(date, end) || date.getTime() === end.getTime());
}

function sumByType(transactions: TransactionDTO[], type: TransactionType) {
  return transactions.filter((transaction) => transaction.type === type).reduce((sum, transaction) => sum + transaction.amount, 0);
}

function buildCategoryTotals(transactions: TransactionDTO[]): CategoryTotal[] {
  const totals = transactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce<Record<Category, number>>(
      (accumulator, transaction) => {
        accumulator[transaction.category] += transaction.amount;
        return accumulator;
      },
      {
        FOOD: 0,
        TRANSPORT: 0,
        HOUSING: 0,
        ENTERTAINMENT: 0,
        HEALTH: 0,
        WORK: 0,
        SUBSCRIPTIONS: 0,
        SHOPPING: 0,
        EDUCATION: 0,
        OTHER: 0
      }
    );

  return Object.entries(totals)
    .map(([category, total]) => {
      const normalized = normalizeCategory(category);
      return {
        category: normalized,
        label: categoryLabel(normalized),
        total,
        color: categoryMeta[normalized].chartColor
      };
    })
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total);
}

function averageExpense(transactions: TransactionDTO[]) {
  const expenses = transactions.filter((transaction) => transaction.type === "EXPENSE");
  if (expenses.length === 0) {
    return 0;
  }
  return expenses.reduce((sum, transaction) => sum + transaction.amount, 0) / expenses.length;
}

function buildDailySeries(transactions: TransactionDTO[]) {
  const now = new Date();
  const points: DailyPoint[] = Array.from({ length: 30 }).map((_, index) => {
    const date = subDays(now, 29 - index);
    return {
      date: format(date, "dd.MM"),
      income: 0,
      expense: 0
    };
  });

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const diff = differenceInCalendarDays(now, date);
    if (diff < 0 || diff > 29) {
      return;
    }
    const point = points[29 - diff];
    if (transaction.type === "INCOME") {
      point.income += transaction.amount;
    } else {
      point.expense += transaction.amount;
    }
  });

  return points;
}

export async function getDashboardData(): Promise<DashboardData> {
  const [settings, transactions] = await Promise.all([getSettings(), listTransactions()]);
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const monthTransactions = transactions.filter((transaction) => isInRange(new Date(transaction.date), monthStart, monthEnd));
  const spent = sumByType(monthTransactions, "EXPENSE");
  const income = sumByType(monthTransactions, "INCOME");
  const percent = settings.monthlyBudget > 0 ? spent / settings.monthlyBudget : 0;
  const status: BudgetStatus = percent >= 1 ? "danger" : percent >= 0.8 ? "warning" : "success";
  const currentWindow = transactions.filter((transaction) => isInRange(new Date(transaction.date), subDays(now, 14), now));
  const previousWindow = transactions.filter((transaction) => isInRange(new Date(transaction.date), subDays(now, 29), subDays(now, 15)));
  const currentAverage = averageExpense(currentWindow);
  const previousAverage = averageExpense(previousWindow);
  const trendPercent = previousAverage > 0 ? ((currentAverage - previousAverage) / previousAverage) * 100 : 0;
  const categoryTotals = buildCategoryTotals(monthTransactions);

  return {
    settings,
    transactionCount: transactions.length,
    budget: {
      total: settings.monthlyBudget,
      spent,
      remaining: settings.monthlyBudget - spent,
      percent,
      daysLeft: Math.max(0, differenceInCalendarDays(monthEnd, now) + 1),
      status
    },
    totals: {
      income,
      expense: spent,
      balance: income - spent
    },
    categoryTotals,
    topCategories: categoryTotals.slice(0, 3),
    averageReceipt: {
      amount: currentAverage,
      trendPercent
    },
    latest: transactions.slice(0, 5),
    dailySeries: buildDailySeries(transactions)
  };
}

export async function getInsightAggregates(): Promise<InsightAggregate> {
  const dashboard = await getDashboardData();
  const transactions = await listTransactions();
  const expenses = transactions.filter((transaction) => transaction.type === "EXPENSE");
  const coffeeTotal = expenses
    .filter((transaction) => /кофе|американо|капучино|латте/i.test(transaction.description))
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const weekdayExpenses = expenses.filter((transaction) => {
    const day = new Date(transaction.date).getDay();
    return day >= 1 && day <= 5;
  });
  const weekendExpenses = expenses.filter((transaction) => {
    const day = new Date(transaction.date).getDay();
    return day === 0 || day === 6;
  });

  return {
    transactionCount: transactions.length,
    monthlyBudget: dashboard.budget.total,
    spentPercent: dashboard.budget.percent,
    totalExpense: dashboard.totals.expense,
    totalIncome: dashboard.totals.income,
    categoryTotals: dashboard.categoryTotals,
    subscriptions: expenses.filter((transaction) => transaction.category === "SUBSCRIPTIONS"),
    coffeeTotal,
    weekdayAverage: averageExpense(weekdayExpenses),
    weekendAverage: averageExpense(weekendExpenses),
    largestTransactions: expenses.sort((a, b) => b.amount - a.amount).slice(0, 5)
  };
}
