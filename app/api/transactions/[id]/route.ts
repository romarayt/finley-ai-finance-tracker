import { NextResponse } from "next/server";
import { z } from "zod";

import { deleteTransaction, updateTransaction } from "@/lib/data";
import { transactionInputSchema } from "@/features/transactions/types";

export const dynamic = "force-dynamic";

const updateSchema = transactionInputSchema.omit({ aiDraft: true, sourceText: true }).partial();

export async function PATCH(request: Request, context: { params: { id: string } }) {
  try {
    const payload = updateSchema.parse(await request.json());
    const transaction = await updateTransaction(context.params.id, payload);

    if (!transaction) {
      return NextResponse.json({ error: "Транзакция не найдена" }, { status: 404 });
    }

    return NextResponse.json({ transaction });
  } catch (error) {
    const message = error instanceof z.ZodError ? error.errors[0]?.message : "Не удалось обновить транзакцию";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: { params: { id: string } }) {
  const deleted = await deleteTransaction(context.params.id);
  if (!deleted) {
    return NextResponse.json({ error: "Транзакция не найдена" }, { status: 404 });
  }

  return NextResponse.json({ deleted: true });
}
