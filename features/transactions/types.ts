import { z } from "zod";

export const categoryValues = [
  "FOOD",
  "TRANSPORT",
  "HOUSING",
  "ENTERTAINMENT",
  "HEALTH",
  "WORK",
  "SUBSCRIPTIONS",
  "SHOPPING",
  "EDUCATION",
  "OTHER"
] as const;

export const transactionTypeValues = ["INCOME", "EXPENSE"] as const;

export type Category = (typeof categoryValues)[number];
export type TransactionType = (typeof transactionTypeValues)[number];

export type Currency = "RUB" | "USD" | "EUR";

export const categorySchema = z.enum(categoryValues);
export const transactionTypeSchema = z.enum(transactionTypeValues);
export const currencySchema = z.enum(["RUB", "USD", "EUR"]);

export const transactionInputSchema = z.object({
  amount: z.coerce.number().int().positive("Введите сумму больше 0"),
  currency: currencySchema.default("RUB"),
  category: categorySchema.default("OTHER"),
  description: z.string().min(2, "Добавьте короткое описание").max(80),
  date: z.string().datetime().or(z.string().min(8)),
  type: transactionTypeSchema.default("EXPENSE"),
  sourceText: z.string().optional(),
  confidence: z.coerce.number().min(0).max(1).optional(),
  aiDraft: z
    .object({
      amount: z.number().int().positive().optional(),
      category: categorySchema.optional(),
      description: z.string().optional()
    })
    .optional()
});

export const parseTransactionSchema = z.object({
  text: z.string().min(3).max(200)
});

export const parsedTransactionSchema = z.object({
  amount: z.coerce.number().int().positive(),
  currency: currencySchema.default("RUB"),
  category: categorySchema.default("OTHER"),
  description: z.string().min(1).max(80),
  date: z.string(),
  type: transactionTypeSchema.default("EXPENSE"),
  confidence: z.coerce.number().min(0).max(1).default(0.72)
});

export const settingsSchema = z.object({
  monthlyBudget: z.coerce.number().int().min(1000).max(100000000),
  currency: currencySchema,
  theme: z.enum(["light", "dark", "system"])
});

export type TransactionInput = z.infer<typeof transactionInputSchema>;
export type ParsedTransaction = z.infer<typeof parsedTransactionSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;

export interface TransactionDTO {
  id: string;
  amount: number;
  currency: Currency;
  category: Category;
  description: string;
  date: string;
  type: TransactionType;
  sourceText?: string | null;
  confidence?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface SettingsDTO {
  monthlyBudget: number;
  currency: Currency;
  theme: "light" | "dark" | "system";
}
