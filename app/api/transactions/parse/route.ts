import { NextResponse } from "next/server";
import { z } from "zod";

import { parseTransactionWithAI } from "@/features/transactions/ai";
import { parseTransactionSchema } from "@/features/transactions/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = parseTransactionSchema.parse(await request.json());
    const transaction = await parseTransactionWithAI(payload.text);
    return NextResponse.json({ transaction });
  } catch (error) {
    const message = error instanceof z.ZodError ? error.errors[0]?.message : "Не удалось распознать фразу";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
