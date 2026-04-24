"use client";

import { Lightbulb, RefreshCw, Sparkles, TrendingDown, TrendingUp, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { InsightDTO } from "@/features/insights/types";
import { cn } from "@/lib/utils";

type InsightsState =
  | {
      state: "loading";
    }
  | {
      state: "empty";
      current: number;
      required: number;
    }
  | {
      state: "generated";
      insights: InsightDTO[];
    }
  | {
      state: "error";
      message: string;
    };

function toneStyle(tone: InsightDTO["tone"]) {
  return {
    success: {
      icon: TrendingDown,
      className: "border-success/30 bg-success/10 text-success",
      badge: "success" as const
    },
    warning: {
      icon: TriangleAlert,
      className: "border-warning/40 bg-warning/15 text-warning",
      badge: "warning" as const
    },
    danger: {
      icon: TrendingUp,
      className: "border-destructive/40 bg-destructive/10 text-destructive",
      badge: "destructive" as const
    },
    neutral: {
      icon: Sparkles,
      className: "border-border bg-secondary text-foreground",
      badge: "secondary" as const
    }
  }[tone];
}

export function InsightsPage() {
  const [state, setState] = useState<InsightsState>({ state: "loading" });

  async function loadInsights() {
    setState({ state: "loading" });
    try {
      const response = await fetch("/api/insights", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Инсайты не загрузились");
      }
      const payload = (await response.json()) as
        | { state: "empty"; current: number; required: number; insights: [] }
        | { state: "generated"; insights: InsightDTO[] };
      if (payload.state === "empty") {
        setState({ state: "empty", current: payload.current, required: payload.required });
      } else {
        setState({ state: "generated", insights: payload.insights });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Finley не смог построить рекомендации.";
      setState({ state: "error", message });
    }
  }

  useEffect(() => {
    void loadInsights();
  }, []);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-display text-2xl">Инсайты</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Finley смотрит не на отдельные траты, а на повторяющееся поведение за месяц.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => void loadInsights()} disabled={state.state === "loading"}>
          <RefreshCw className={cn("h-4 w-4", state.state === "loading" && "animate-pulse")} aria-hidden="true" />
          Обновить
        </Button>
      </section>

      {state.state === "loading" && (
        <div className="grid gap-4 lg:grid-cols-3" role="status" aria-live="polite">
          {[0, 1, 2].map((item) => (
            <Card key={item}>
              <CardHeader>
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {state.state === "empty" && (
        <Card>
          <CardContent className="flex min-h-80 flex-col items-center justify-center gap-4 text-center">
            <Lightbulb className="h-12 w-12 text-primary" aria-hidden="true" />
            <div className="space-y-2">
              <h2 className="font-display text-xl">Пока мало данных</h2>
              <p className="max-w-md text-sm text-muted-foreground">
                Добавь минимум {state.required} транзакций, чтобы увидеть инсайты. Сейчас есть {state.current}.
              </p>
            </div>
            <Badge variant="secondary">{state.required - state.current} до анализа</Badge>
          </CardContent>
        </Card>
      )}

      {state.state === "error" && (
        <Card>
          <CardContent className="flex min-h-80 flex-col items-center justify-center gap-4 text-center">
            <TriangleAlert className="h-12 w-12 text-warning" aria-hidden="true" />
            <div className="space-y-2">
              <h2 className="font-display text-xl">Инсайты не построились</h2>
              <p className="max-w-md text-sm text-muted-foreground">{state.message}. Данные сохранены, можно повторить запрос.</p>
            </div>
            <Button type="button" onClick={() => void loadInsights()}>
              Повторить
            </Button>
          </CardContent>
        </Card>
      )}

      {state.state === "generated" && (
        <div className="grid gap-4 lg:grid-cols-3">
          {state.insights.map((insight) => {
            const tone = toneStyle(insight.tone);
            const Icon = tone.icon;
            return (
              <Card key={insight.title} className={cn("border", tone.className)}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-current/20 bg-surface">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <Badge variant={tone.badge}>{insight.metric}</Badge>
                  </div>
                  <CardTitle>{insight.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{insight.body}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
