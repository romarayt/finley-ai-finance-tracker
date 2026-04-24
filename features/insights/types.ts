import { z } from "zod";

export const insightSchema = z.object({
  title: z.string().min(3).max(90),
  body: z.string().min(10).max(240),
  tone: z.enum(["success", "warning", "danger", "neutral"]),
  metric: z.string().min(1).max(32)
});

export const insightsResponseSchema = z.object({
  insights: z.array(insightSchema).min(1).max(5)
});

export type InsightDTO = z.infer<typeof insightSchema>;
