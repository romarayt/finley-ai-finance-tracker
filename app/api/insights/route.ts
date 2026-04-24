import { NextResponse } from "next/server";

import { generateInsights } from "@/features/insights/ai";
import { getInsightAggregates } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const aggregate = await getInsightAggregates();

  if (aggregate.transactionCount < 20) {
    return NextResponse.json({
      state: "empty",
      current: aggregate.transactionCount,
      required: 20,
      insights: []
    });
  }

  const insights = await generateInsights(aggregate);
  return NextResponse.json({
    state: "generated",
    insights
  });
}
