import { NextResponse } from "next/server";

import { categoryLabel } from "@/features/transactions/categories";
import { listTransactions } from "@/lib/data";

export const dynamic = "force-dynamic";

function csvCell(value: string | number | null | undefined) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET() {
  const transactions = await listTransactions();
  const rows = [
    ["Дата", "Тип", "Категория", "Описание", "Сумма", "Валюта", "Confidence"],
    ...transactions.map((transaction) => [
      new Date(transaction.date).toLocaleDateString("ru-RU"),
      transaction.type === "INCOME" ? "Доход" : "Расход",
      categoryLabel(transaction.category),
      transaction.description,
      transaction.amount,
      transaction.currency,
      transaction.confidence?.toFixed(2) ?? ""
    ])
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\n")}`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=finley-transactions.csv"
    }
  });
}
