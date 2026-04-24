import { NextResponse } from "next/server";
import { z } from "zod";

import { clearAllTransactions, createTransaction, listTransactions } from "@/lib/data";
import { transactionInputSchema } from "@/features/transactions/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const transactions = await listTransactions();
  return NextResponse.json({ transactions });
}

export async function POST(request: Request) {
  try {
    const payload = transactionInputSchema.parse(await request.json());
    const transaction = await createTransaction(payload);
    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    const message = error instanceof z.ZodError ? error.errors[0]?.message : "Не удалось сохранить транзакцию";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE() {
  const count = await clearAllTransactions();
  return NextResponse.json({ deleted: count });
}
