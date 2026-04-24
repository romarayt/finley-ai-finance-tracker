import { NextResponse } from "next/server";

import { getDashboardData, listTransactions } from "@/lib/data";
import { createSimplePdf } from "@/lib/pdf";

export const dynamic = "force-dynamic";

export async function GET() {
  const [dashboard, transactions] = await Promise.all([getDashboardData(), listTransactions()]);
  const lines = [
    "Finley financial report",
    `Generated: ${new Date().toISOString().slice(0, 10)}`,
    `Budget: ${dashboard.budget.total} ${dashboard.settings.currency}`,
    `Spent: ${dashboard.budget.spent} ${dashboard.settings.currency}`,
    `Remaining: ${dashboard.budget.remaining} ${dashboard.settings.currency}`,
    `Income: ${dashboard.totals.income} ${dashboard.settings.currency}`,
    `Transactions: ${transactions.length}`,
    "",
    "Top categories:",
    ...dashboard.topCategories.map((item) => `${item.category}: ${item.total} ${dashboard.settings.currency}`),
    "",
    "Latest transactions:",
    ...transactions.slice(0, 12).map((transaction) => `${transaction.date.slice(0, 10)} ${transaction.type} ${transaction.category} ${transaction.amount}`)
  ];
  const pdf = createSimplePdf(lines);

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=finley-report.pdf"
    }
  });
}
