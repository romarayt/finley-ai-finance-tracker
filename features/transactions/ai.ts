import OpenAI from "openai";

import { categoryLabel } from "@/features/transactions/categories";
import {
  categoryValues,
  parsedTransactionSchema,
  type Category,
  type ParsedTransaction,
  type TransactionType
} from "@/features/transactions/types";

const keywordCategories: Array<{ category: Category; keywords: RegExp[] }> = [
  { category: "FOOD", keywords: [/обед/i, /ужин/i, /завтрак/i, /кофе/i, /магнит/i, /вкусвилл/i, /перекресток/i, /еда/i, /продукт/i] },
  { category: "TRANSPORT", keywords: [/такси/i, /uber/i, /метро/i, /автобус/i, /бензин/i, /парков/i, /каршер/i] },
  { category: "HOUSING", keywords: [/аренд/i, /квартир/i, /коммун/i, /интернет/i, /дом/i] },
  { category: "ENTERTAINMENT", keywords: [/кино/i, /бар/i, /концерт/i, /выстав/i, /театр/i] },
  { category: "HEALTH", keywords: [/аптек/i, /врач/i, /стомат/i, /здоров/i, /трениров/i] },
  { category: "WORK", keywords: [/клиент/i, /работ/i, /офис/i, /зарплат/i, /фриланс/i, /бонус/i] },
  { category: "SUBSCRIPTIONS", keywords: [/подпис/i, /netflix/i, /spotify/i, /notion/i, /плюс/i] },
  { category: "SHOPPING", keywords: [/ozon/i, /рубаш/i, /кроссов/i, /купил/i, /шоп/i] },
  { category: "EDUCATION", keywords: [/курс/i, /книг/i, /обуч/i, /универс/i] }
];

function extractAmount(text: string) {
  const match = text.replace(",", ".").match(/(\d+(?:\.\d+)?)/);
  return match ? Math.round(Number(match[1])) : 0;
}

function detectType(text: string): TransactionType {
  return /получил|заработал|зарплат|доход|фриланс|вернули|возврат|бонус/i.test(text) ? "INCOME" : "EXPENSE";
}

function detectCategory(text: string): Category {
  const found = keywordCategories.find((entry) => entry.keywords.some((keyword) => keyword.test(text)));
  return found?.category ?? "OTHER";
}

function buildDescription(text: string, amount: number) {
  const cleaned = text
    .replace(String(amount), "")
    .replace(/потратил|потратила|потрачено|на|за|получил|получила|рублей|руб|₽/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length < 2) {
    return "Быстрая транзакция";
  }

  return cleaned[0].toUpperCase() + cleaned.slice(1, 80);
}

function hasDateHint(text: string) {
  return /сегодня|вчера|позавчера|\d{1,2}[./-]\d{1,2}|январ|феврал|март|апрел|ма[йя]|июн|июл|август|сентябр|октябр|ноябр|декабр/i.test(text);
}

function normalizeParsedDate(text: string, parsed: ParsedTransaction): ParsedTransaction {
  if (!hasDateHint(text)) {
    return {
      ...parsed,
      date: new Date().toISOString()
    };
  }

  const parsedDate = new Date(parsed.date);
  if (Number.isNaN(parsedDate.getTime())) {
    return {
      ...parsed,
      date: new Date().toISOString()
    };
  }

  return parsed;
}

export function fallbackParseTransaction(text: string): ParsedTransaction {
  const amount = extractAmount(text);
  const type = detectType(text);
  const category = type === "INCOME" ? "WORK" : detectCategory(text);

  return normalizeParsedDate(text, {
    amount: amount > 0 ? amount : 1000,
    currency: "RUB",
    category,
    description: buildDescription(text, amount),
    date: new Date().toISOString(),
    type,
    confidence: amount > 0 ? 0.7 : 0.42
  });
}

export async function parseTransactionWithAI(text: string): Promise<ParsedTransaction> {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackParseTransaction(text);
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const categories = categoryValues.map((value) => `${value} (${categoryLabel(value)})`).join(", ");

  try {
    const completion = await openai.chat.completions.create(
      {
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Ты парсер личных финансов. Верни только валидный JSON без markdown. Суммы храни целыми единицами валюты. Категорию и type возвращай только enum-значениями."
          },
          {
            role: "user",
            content: `Текст: "${text}".
Текущая дата: ${new Date().toISOString()}.
Если дата не указана явно, используй текущую дату.
Категории: ${categories}.
JSON schema: { "amount": number, "currency": "RUB" | "USD" | "EUR", "category": enum, "description": string, "date": ISO string, "type": "INCOME" | "EXPENSE", "confidence": number 0..1 }`
          }
        ],
        temperature: 0.1
      },
      { timeout: 10000 }
    );

    const content = completion.choices[0]?.message.content;
    if (!content) {
      return fallbackParseTransaction(text);
    }

    return normalizeParsedDate(text, parsedTransactionSchema.parse(JSON.parse(content)));
  } catch (error) {
    console.error("AI parse failed:", error);
    return fallbackParseTransaction(text);
  }
}
