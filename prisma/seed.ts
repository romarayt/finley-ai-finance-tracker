import { PrismaClient } from "@prisma/client";

import { seedFixtures, fixtureDate } from "../lib/seed-fixtures";

const prisma = new PrismaClient();

async function main() {
  await prisma.correction.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.settings.upsert({
    where: { id: "default" },
    update: {
      monthlyBudget: 80000,
      currency: "RUB",
      theme: "system"
    },
    create: {
      id: "default",
      monthlyBudget: 80000,
      currency: "RUB",
      theme: "system"
    }
  });

  await prisma.transaction.createMany({
    data: seedFixtures.map((transaction, index) => ({
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description,
      type: transaction.type,
      currency: "RUB",
      confidence: transaction.type === "EXPENSE" ? 0.82 + (index % 12) / 100 : 0.94,
      occurredAt: fixtureDate(transaction.daysAgo),
      sourceText: transaction.type === "EXPENSE" ? `потратил ${transaction.amount} ${transaction.description}` : null
    }))
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
