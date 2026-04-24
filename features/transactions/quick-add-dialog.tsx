"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { BrainCircuit, CalendarDays, Check, CircleAlert, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryMeta } from "@/features/transactions/categories";
import {
  categoryValues,
  transactionInputSchema,
  type Category,
  type ParsedTransaction,
  type TransactionInput
} from "@/features/transactions/types";
import { cn, formatMoney } from "@/lib/utils";

type ParseStatus = "idle" | "parsing" | "slow" | "parsed" | "manual" | "timeout" | "error";

interface QuickAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function toInputDate(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function fromInputDate(value: string) {
  return new Date(value).toISOString();
}

function confidenceVariant(confidence?: number | null) {
  if (confidence === undefined || confidence === null) {
    return "secondary" as const;
  }
  if (confidence >= 0.8) {
    return "success" as const;
  }
  return "warning" as const;
}

const defaultParsed: ParsedTransaction = {
  amount: 1000,
  currency: "RUB",
  category: "OTHER",
  description: "Быстрая транзакция",
  date: new Date().toISOString(),
  type: "EXPENSE",
  confidence: 0.5
};

export function QuickAddDialog({ open, onOpenChange }: QuickAddDialogProps) {
  const router = useRouter();
  const [phrase, setPhrase] = useState("");
  const [status, setStatus] = useState<ParseStatus>("idle");
  const [draft, setDraft] = useState<ParsedTransaction | null>(null);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const form = useForm<TransactionInput>({
    resolver: zodResolver(transactionInputSchema),
    defaultValues: {
      amount: defaultParsed.amount,
      currency: "RUB",
      category: "OTHER",
      description: defaultParsed.description,
      date: defaultParsed.date,
      type: "EXPENSE",
      confidence: defaultParsed.confidence
    }
  });

  const selectedCategory = form.watch("category") as Category;
  const selectedMeta = categoryMeta[selectedCategory] ?? categoryMeta.OTHER;
  const selectedIcon = selectedMeta.icon;
  const confidence = form.watch("confidence");

  const helperText = useMemo(() => {
    if (status === "slow") {
      return "Это занимает дольше обычного. Я всё ещё жду ответ модели.";
    }
    if (status === "timeout") {
      return "AI не ответил за 10 секунд. Можно повторить или заполнить форму вручную.";
    }
    if (status === "error") {
      return error || "Не удалось распознать фразу. Проверьте сумму и описание вручную.";
    }
    return "Enter распознает фразу, затем можно поправить любое поле.";
  }, [error, status]);

  useEffect(() => {
    if (!open) {
      abortRef.current?.abort();
      setStatus("idle");
      setPhrase("");
      setDraft(null);
      setError("");
      form.reset({
        amount: defaultParsed.amount,
        currency: "RUB",
        category: "OTHER",
        description: defaultParsed.description,
        date: new Date().toISOString(),
        type: "EXPENSE",
        confidence: defaultParsed.confidence
      });
    }
  }, [form, open]);

  async function parsePhrase() {
    if (phrase.trim().length < 3) {
      setError("Введите фразу чуть подробнее, например: потратил 1200 на обед.");
      setStatus("error");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus("parsing");
    setError("");

    const slowTimer = window.setTimeout(() => setStatus((current) => (current === "parsing" ? "slow" : current)), 3000);
    const timeoutTimer = window.setTimeout(() => {
      controller.abort();
      setStatus("timeout");
    }, 10000);

    try {
      const response = await fetch("/api/transactions/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: phrase }),
        signal: controller.signal
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Не удалось распознать транзакцию");
      }

      const payload = (await response.json()) as { transaction: ParsedTransaction };
      setDraft(payload.transaction);
      form.reset({
        ...payload.transaction,
        date: payload.transaction.date,
        sourceText: phrase,
        aiDraft: {
          amount: payload.transaction.amount,
          category: payload.transaction.category,
          description: payload.transaction.description
        }
      });
      setStatus("parsed");
    } catch (requestError) {
      if (controller.signal.aborted) {
        return;
      }
      const message = requestError instanceof Error ? requestError.message : "Не удалось распознать транзакцию";
      setError(message);
      setDraft(defaultParsed);
      form.reset({
        ...defaultParsed,
        date: new Date().toISOString(),
        sourceText: phrase
      });
      setStatus("manual");
    } finally {
      window.clearTimeout(slowTimer);
      window.clearTimeout(timeoutTimer);
    }
  }

  async function saveTransaction(values: TransactionInput) {
    const payload = {
      ...values,
      date: values.date.includes("T") ? values.date : new Date(values.date).toISOString(),
      sourceText: phrase || values.sourceText,
      aiDraft: draft
        ? {
            amount: draft.amount,
            category: draft.category,
            description: draft.description
          }
        : values.aiDraft
    };

    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const result = (await response.json()) as { error?: string };
      toast.error(result.error ?? "Транзакция не сохранена");
      return;
    }

    toast.success("Транзакция сохранена", {
      description: "Dashboard и история обновятся автоматически."
    });
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="quick-add-description">
        <DialogHeader>
          <DialogTitle>Добавить транзакцию</DialogTitle>
          <DialogDescription id="quick-add-description">
            Одной фразой. AI предложит категорию, вы контролируете финальный результат.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quick-phrase">Фраза</Label>
            <Input
              id="quick-phrase"
              value={phrase}
              onChange={(event) => setPhrase(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void parsePhrase();
                }
              }}
              placeholder="Например: потратил 1200 на обед с Никой"
              aria-describedby="quick-add-helper"
            />
            <p id="quick-add-helper" className={cn("text-sm text-muted-foreground", (status === "error" || status === "timeout") && "text-destructive")}>
              {helperText}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {(status === "parsing" || status === "slow") && (
              <motion.div
                key="parsing"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                role="status"
                aria-live="polite"
                className="rounded-lg border border-border bg-secondary p-4"
              >
                <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <BrainCircuit className="h-4 w-4 animate-pulse text-primary" aria-hidden="true" />
                  AI классифицирует...
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {(status === "parsed" || status === "manual" || status === "timeout") && (
            <motion.form
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
              onSubmit={form.handleSubmit(saveTransaction)}
            >
              <div className="rounded-lg border border-border bg-surface p-4 shadow-xs">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {selectedIcon({ className: cn("h-5 w-5", selectedMeta.color), "aria-hidden": true })}
                    <span className="text-sm font-medium">Превью</span>
                  </div>
                  <Badge variant={confidenceVariant(confidence)}>
                    confidence {Math.round((confidence ?? 0) * 100)}%
                  </Badge>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Сумма</Label>
                    <Input id="amount" inputMode="numeric" {...form.register("amount", { valueAsNumber: true })} />
                    {form.formState.errors.amount && <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Тип</Label>
                    <Controller
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger aria-label="Тип транзакции">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EXPENSE">Расход</SelectItem>
                            <SelectItem value="INCOME">Доход</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Категория</Label>
                    <Controller
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger aria-label="Категория транзакции">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryValues.map((category) => (
                              <SelectItem key={category} value={category}>
                                {categoryMeta[category].label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Дата</Label>
                    <Controller
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <Input
                          id="date"
                          type="datetime-local"
                          value={toInputDate(field.value)}
                          onChange={(event) => field.onChange(fromInputDate(event.target.value))}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Label htmlFor="description">Описание</Label>
                  <Input id="description" {...form.register("description")} />
                  {form.formState.errors.description && <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>}
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  <span className="money">{formatMoney(Number(form.watch("amount") || 0), form.watch("currency"))}</span>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Отмена
                </Button>
                <Button type="submit">
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Сохранить
                </Button>
              </div>
            </motion.form>
          )}

          {(status === "idle" || status === "error") && (
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              {status === "error" && (
                <Button type="button" variant="outline" onClick={() => setStatus("manual")}>
                  <CircleAlert className="h-4 w-4" aria-hidden="true" />
                  Заполнить вручную
                </Button>
              )}
              <Button type="button" onClick={() => void parsePhrase()}>
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Распознать
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
