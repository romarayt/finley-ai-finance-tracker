import { ArrowDownRight, ArrowUpRight, CircleDollarSign, ReceiptText, WalletCards } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { categoryMeta } from "@/features/transactions/categories";
import { AnimatedMoney } from "@/features/dashboard/animated-money";
import { CashflowLine, CategoryDonut } from "@/features/dashboard/dashboard-charts";
import type { DashboardData } from "@/lib/data";
import { cn, formatMoney } from "@/lib/utils";

function statusTone(status: DashboardData["budget"]["status"]) {
  return {
    success: {
      label: "В рамках бюджета",
      className: "border-success/30 bg-success/10 text-success",
      progress: "success" as const
    },
    warning: {
      label: "Близко к лимиту",
      className: "border-warning/40 bg-warning/15 text-warning",
      progress: "warning" as const
    },
    danger: {
      label: "Бюджет превышен",
      className: "border-destructive/40 bg-destructive/10 text-destructive",
      progress: "danger" as const
    }
  }[status];
}

export function DashboardPage({ data }: { data: DashboardData }) {
  const tone = statusTone(data.budget.status);

  if (data.transactionCount === 0) {
    return (
      <Card>
        <CardContent className="flex min-h-96 flex-col items-center justify-center gap-4 text-center">
          <WalletCards className="h-12 w-12 text-primary" aria-hidden="true" />
          <div className="space-y-2">
            <h1 className="font-display text-2xl">Финансовая картина пока пустая</h1>
            <p className="max-w-md text-sm text-muted-foreground">
              Добавьте первую транзакцию одной фразой, и Finley сразу покажет бюджет, категории и динамику.
            </p>
          </div>
          <Button asChild>
            <Link href="/history">Открыть историю</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <section className={cn("rounded-2xl border p-8 shadow-xl", tone.className)} aria-labelledby="budget-title">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <Badge variant={data.budget.status === "danger" ? "destructive" : data.budget.status}>{tone.label}</Badge>
            <div className="space-y-2">
              <h1 id="budget-title" className="text-sm font-medium text-foreground/80">
                Осталось в бюджете
              </h1>
              <AnimatedMoney
                value={data.budget.remaining}
                currency={data.settings.currency}
                className="money block font-display text-4xl text-foreground"
              />
            </div>
            <p className="text-sm text-foreground/80">На {data.budget.daysLeft} дней до конца месяца</p>
          </div>
          <div className="w-full max-w-md space-y-3">
            <div className="flex items-center justify-between text-sm text-foreground">
              <span>{Math.round(data.budget.percent * 100)}% бюджета использовано</span>
              <span className="money">{formatMoney(data.budget.spent, data.settings.currency)}</span>
            </div>
            <Progress value={data.budget.percent * 100} tone={tone.progress} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3" aria-label="Ключевые метрики">
        <Card className="lg:col-span-2 lg:row-span-2">
          <CardHeader>
            <CardTitle>Расходы по категориям</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryDonut data={data.categoryTotals} currency={data.settings.currency} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Топ-3 категории</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topCategories.map((item) => {
              const Icon = categoryMeta[item.category].icon;
              return (
                <div key={item.category} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg border", categoryMeta[item.category].softColor)}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="money text-sm">{formatMoney(item.total, data.settings.currency)}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Средний чек</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-4">
              <span className="money text-2xl font-semibold">{formatMoney(data.averageReceipt.amount, data.settings.currency)}</span>
              <Badge variant={data.averageReceipt.trendPercent <= 0 ? "success" : "warning"}>
                {data.averageReceipt.trendPercent <= 0 ? (
                  <ArrowDownRight className="mr-1 h-3 w-3" aria-hidden="true" />
                ) : (
                  <ArrowUpRight className="mr-1 h-3 w-3" aria-hidden="true" />
                )}
                {Math.abs(data.averageReceipt.trendPercent).toFixed(0)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Последние 5 транзакций</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/history">История</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-5">
              {data.latest.map((transaction) => {
                const Icon = transaction.type === "INCOME" ? CircleDollarSign : categoryMeta[transaction.category].icon;
                return (
                  <div key={transaction.id} className="rounded-lg border border-border bg-background p-3">
                    <div className="mb-3 flex items-center gap-2">
                      <Icon className={cn("h-4 w-4", transaction.type === "INCOME" ? "text-success" : categoryMeta[transaction.category].color)} aria-hidden="true" />
                      <span className="truncate text-sm font-medium">{transaction.description}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>{new Date(transaction.date).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })}</span>
                      <span className="money text-foreground">{formatMoney(transaction.amount, transaction.currency)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="cashflow-title">
        <Card>
          <CardHeader>
            <CardTitle id="cashflow-title">Доходы vs расходы за 30 дней</CardTitle>
          </CardHeader>
          <CardContent>
            <CashflowLine data={data.dailySeries} currency={data.settings.currency} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
