import { NextResponse } from "next/server";
import { z } from "zod";

import { getSettings, updateSettings } from "@/lib/data";
import { settingsSchema } from "@/features/transactions/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  try {
    const payload = settingsSchema.parse(await request.json());
    const settings = await updateSettings(payload);
    return NextResponse.json({ settings });
  } catch (error) {
    const message = error instanceof z.ZodError ? error.errors[0]?.message : "Не удалось обновить настройки";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
