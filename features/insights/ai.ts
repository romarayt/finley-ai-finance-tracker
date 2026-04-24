import OpenAI from "openai";

import type { InsightAggregate } from "@/lib/data";
import { formatMoney } from "@/lib/utils";
import { insightsResponseSchema, type InsightDTO } from "@/features/insights/types";

function ratioText(a: number, b: number) {
  if (b <= 0) {
    return "нет базы";
  }
  return `${(a / b).toFixed(1)}x`;
}

export function fallbackInsights(aggregate: InsightAggregate): InsightDTO[] {
  const top = aggregate.categoryTotals[0];
  const subscriptionTotal = aggregate.subscriptions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const weekendRatio = ratioText(aggregate.weekendAverage, aggregate.weekdayAverage);

  return [
    {
      title: top ? `${top.label} забирает больше всего бюджета` : "Пока мало выраженных паттернов",
      body: top
        ? `За месяц на эту категорию ушло ${formatMoney(top.total)}. Проверь повторяющиеся покупки: там обычно проще всего вернуть контроль.`
        : "Добавьте еще несколько транзакций, чтобы Finley нашел устойчивые привычки.",
      tone: aggregate.spentPercent > 1 ? "danger" : aggregate.spentPercent > 0.8 ? "warning" : "neutral",
      metric: top ? formatMoney(top.total) : "0 ₽"
    },
    {
      title: "Подписки стоит пересмотреть",
      body: `Регулярные списания сейчас занимают ${formatMoney(subscriptionTotal)}. Отключение одной неиспользуемой подписки часто дает быстрый эффект без смены образа жизни.`,
      tone: subscriptionTotal > 3000 ? "warning" : "neutral",
      metric: formatMoney(subscriptionTotal)
    },
    {
      title: "Выходные дороже будней",
      body: `Средний чек в выходные сейчас ${formatMoney(aggregate.weekendAverage)}, это ${weekendRatio} к будням. Лимит на один выходной платеж поможет сгладить пики.`,
      tone: aggregate.weekendAverage > aggregate.weekdayAverage * 2 ? "warning" : "success",
      metric: weekendRatio
    }
  ];
}

export async function generateInsights(aggregate: InsightAggregate): Promise<InsightDTO[]> {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackInsights(aggregate);
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const completion = await openai.chat.completions.create(
      {
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "Ты финансовый аналитик для занятого профессионала. Дай 3 коротких поведенческих инсайта на русском. Без морализаторства. Верни только JSON."
          },
          {
            role: "user",
            content: `Агрегаты: ${JSON.stringify(aggregate)}.
JSON schema: { "insights": [{ "title": string, "body": string, "tone": "success" | "warning" | "danger" | "neutral", "metric": string }] }`
          }
        ]
      },
      { timeout: 10000 }
    );

    const content = completion.choices[0]?.message.content;
    if (!content) {
      return fallbackInsights(aggregate);
    }

    return insightsResponseSchema.parse(JSON.parse(content)).insights;
  } catch (error) {
    console.error("AI insights failed:", error);
    return fallbackInsights(aggregate);
  }
}
