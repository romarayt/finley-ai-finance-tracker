import type { Category, TransactionDTO, TransactionType } from "@/features/transactions/types";

export type SeedFixture = {
  amount: number;
  category: Category;
  description: string;
  type: TransactionType;
  daysAgo: number;
};

export const seedFixtures: SeedFixture[] = [
  { amount: 45000, category: "HOUSING", description: "Аренда квартиры", type: "EXPENSE", daysAgo: 25 },
  { amount: 4200, category: "HOUSING", description: "Коммунальные платежи", type: "EXPENSE", daysAgo: 18 },
  { amount: 2400, category: "HOUSING", description: "Интернет домой", type: "EXPENSE", daysAgo: 7 },
  { amount: 1800, category: "HOUSING", description: "Хозтовары для кухни", type: "EXPENSE", daysAgo: 4 },
  { amount: 320, category: "FOOD", description: "Кофе на вынос", type: "EXPENSE", daysAgo: 1 },
  { amount: 1200, category: "FOOD", description: "Обед с Никой", type: "EXPENSE", daysAgo: 2 },
  { amount: 3860, category: "FOOD", description: "Магнит продукты", type: "EXPENSE", daysAgo: 3 },
  { amount: 2900, category: "FOOD", description: "ВкусВилл на неделю", type: "EXPENSE", daysAgo: 5 },
  { amount: 740, category: "FOOD", description: "Завтрак у офиса", type: "EXPENSE", daysAgo: 6 },
  { amount: 260, category: "FOOD", description: "Американо перед встречей", type: "EXPENSE", daysAgo: 8 },
  { amount: 1680, category: "FOOD", description: "Ужин в раменной", type: "EXPENSE", daysAgo: 10 },
  { amount: 4450, category: "FOOD", description: "Перекресток продукты", type: "EXPENSE", daysAgo: 12 },
  { amount: 350, category: "FOOD", description: "Кофе и круассан", type: "EXPENSE", daysAgo: 14 },
  { amount: 980, category: "FOOD", description: "Доставка обеда", type: "EXPENSE", daysAgo: 16 },
  { amount: 2150, category: "FOOD", description: "Семейный ужин", type: "EXPENSE", daysAgo: 19 },
  { amount: 520, category: "FOOD", description: "Смузи после тренировки", type: "EXPENSE", daysAgo: 21 },
  { amount: 3100, category: "FOOD", description: "Лента продукты", type: "EXPENSE", daysAgo: 23 },
  { amount: 410, category: "FOOD", description: "Кофе с собой", type: "EXPENSE", daysAgo: 27 },
  { amount: 1550, category: "FOOD", description: "Бизнес-ланч", type: "EXPENSE", daysAgo: 29 },
  { amount: 680, category: "TRANSPORT", description: "Uber до работы", type: "EXPENSE", daysAgo: 1 },
  { amount: 1240, category: "TRANSPORT", description: "Такси после ужина", type: "EXPENSE", daysAgo: 3 },
  { amount: 2300, category: "TRANSPORT", description: "Бензин", type: "EXPENSE", daysAgo: 6 },
  { amount: 620, category: "TRANSPORT", description: "Каршеринг до встречи", type: "EXPENSE", daysAgo: 9 },
  { amount: 190, category: "TRANSPORT", description: "Метро и автобус", type: "EXPENSE", daysAgo: 13 },
  { amount: 860, category: "TRANSPORT", description: "Такси в аэропорт", type: "EXPENSE", daysAgo: 20 },
  { amount: 450, category: "TRANSPORT", description: "Парковка в центре", type: "EXPENSE", daysAgo: 28 },
  { amount: 1350, category: "ENTERTAINMENT", description: "Кино с друзьями", type: "EXPENSE", daysAgo: 2 },
  { amount: 2800, category: "ENTERTAINMENT", description: "Бар в пятницу", type: "EXPENSE", daysAgo: 8 },
  { amount: 1700, category: "ENTERTAINMENT", description: "Билеты на выставку", type: "EXPENSE", daysAgo: 15 },
  { amount: 3600, category: "ENTERTAINMENT", description: "Концерт", type: "EXPENSE", daysAgo: 24 },
  { amount: 899, category: "SUBSCRIPTIONS", description: "Netflix подписка", type: "EXPENSE", daysAgo: 5 },
  { amount: 299, category: "SUBSCRIPTIONS", description: "Яндекс Плюс", type: "EXPENSE", daysAgo: 11 },
  { amount: 1290, category: "SUBSCRIPTIONS", description: "Notion AI", type: "EXPENSE", daysAgo: 17 },
  { amount: 799, category: "SUBSCRIPTIONS", description: "Spotify", type: "EXPENSE", daysAgo: 26 },
  { amount: 4200, category: "SHOPPING", description: "Рубашка для офиса", type: "EXPENSE", daysAgo: 4 },
  { amount: 2350, category: "SHOPPING", description: "Ozon бытовые мелочи", type: "EXPENSE", daysAgo: 9 },
  { amount: 5900, category: "SHOPPING", description: "Кроссовки", type: "EXPENSE", daysAgo: 19 },
  { amount: 1480, category: "SHOPPING", description: "Книга и блокнот", type: "EXPENSE", daysAgo: 25 },
  { amount: 2600, category: "HEALTH", description: "Аптека", type: "EXPENSE", daysAgo: 6 },
  { amount: 3500, category: "HEALTH", description: "Стоматолог консультация", type: "EXPENSE", daysAgo: 22 },
  { amount: 1200, category: "WORK", description: "Обед с клиентом", type: "EXPENSE", daysAgo: 12 },
  { amount: 2100, category: "WORK", description: "Такси на встречу", type: "EXPENSE", daysAgo: 18 },
  { amount: 4990, category: "EDUCATION", description: "Курс по аналитике", type: "EXPENSE", daysAgo: 16 },
  { amount: 1750, category: "EDUCATION", description: "Книга по финансам", type: "EXPENSE", daysAgo: 28 },
  { amount: 900, category: "OTHER", description: "Подарок коллеге", type: "EXPENSE", daysAgo: 13 },
  { amount: 650, category: "OTHER", description: "Химчистка", type: "EXPENSE", daysAgo: 21 },
  { amount: 145000, category: "WORK", description: "Зарплата", type: "INCOME", daysAgo: 24 },
  { amount: 28000, category: "WORK", description: "Фриланс проект", type: "INCOME", daysAgo: 15 },
  { amount: 12000, category: "WORK", description: "Бонус за квартал", type: "INCOME", daysAgo: 8 },
  { amount: 8500, category: "OTHER", description: "Возврат долга", type: "INCOME", daysAgo: 3 }
];

export function fixtureDate(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(9 + (daysAgo % 11), (daysAgo * 7) % 60, 0, 0);
  return date;
}

export function buildSeedTransactions(): TransactionDTO[] {
  return seedFixtures.map((fixture, index) => {
    const now = new Date();
    const occurredAt = fixtureDate(fixture.daysAgo);
    return {
      id: `seed-${index + 1}`,
      amount: fixture.amount,
      currency: "RUB",
      category: fixture.category,
      description: fixture.description,
      date: occurredAt.toISOString(),
      type: fixture.type,
      sourceText: fixture.type === "EXPENSE" ? `потратил ${fixture.amount} ${fixture.description}` : null,
      confidence: fixture.type === "EXPENSE" ? 0.82 + (index % 12) / 100 : 0.94,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
  });
}
