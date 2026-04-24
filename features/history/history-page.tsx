"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import { Edit3, Search, Trash2, WalletCards } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryMeta } from "@/features/transactions/categories";
import { categoryValues, type Category, type TransactionDTO, type TransactionType } from "@/features/transactions/types";
import { cn, formatMoney } from "@/lib/utils";

type FlatItem =
  | {
      kind: "header";
      id: string;
      label: string;
    }
  | {
      kind: "transaction";
      id: string;
      transaction: TransactionDTO;
    };

function sameOrAfter(date: Date, start?: string) {
  if (!start) {
    return true;
  }
  const startDate = new Date(start);
  startDate.setHours(0, 0, 0, 0);
  return isAfter(date, startDate) || date.getTime() === startDate.getTime();
}

function sameOrBefore(date: Date, end?: string) {
  if (!end) {
    return true;
  }
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);
  return isBefore(date, endDate) || date.getTime() === endDate.getTime();
}

function groupTransactions(transactions: TransactionDTO[]) {
  const items: FlatItem[] = [];
  let currentKey = "";

  transactions.forEach((transaction) => {
    const date = parseISO(transaction.date);
    const key = format(date, "yyyy-MM-dd");
    if (key !== currentKey) {
      currentKey = key;
      items.push({
        kind: "header",
        id: `header-${key}`,
        label: format(date, "d MMMM, EEEE", { locale: ru })
      });
    }
    items.push({ kind: "transaction", id: transaction.id, transaction });
  });

  return items;
}

function TransactionRow({
  transaction,
  onDelete,
  onEdit
}: {
  transaction: TransactionDTO;
  onDelete: (transaction: TransactionDTO) => void;
  onEdit: (transaction: TransactionDTO) => void;
}) {
  const Icon = transaction.type === "INCOME" ? WalletCards : categoryMeta[transaction.category].icon;
  const isIncome = transaction.type === "INCOME";

  return (
    <motion.article
      layout
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.08}
      onDragEnd={(_, info) => {
        if (info.offset.x < -80) {
          onDelete(transaction);
        }
        if (info.offset.x > 80) {
          onEdit(transaction);
        }
      }}
      exit={{ opacity: 0, x: -24, height: 0 }}
      transition={{ duration: 0.25 }}
      className="group relative grid min-h-16 grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-border bg-surface p-3 shadow-xs"
    >
      <span className={cn("flex h-11 w-11 items-center justify-center rounded-lg border", isIncome ? "border-success/30 bg-success/10 text-success" : categoryMeta[transaction.category].softColor)}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-medium">{transaction.description}</h3>
          {transaction.confidence !== null && transaction.confidence !== undefined && (
            <Badge variant={transaction.confidence >= 0.8 ? "success" : "warning"}>{Math.round(transaction.confidence * 100)}%</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {isIncome ? "Доход" : categoryMeta[transaction.category].label} · {format(parseISO(transaction.date), "HH:mm")}
        </p>
      </div>
      <div className="text-right">
        <p className={cn("money text-sm font-medium", isIncome && "text-success")}>{isIncome ? "+" : ""}{formatMoney(transaction.amount, transaction.currency)}</p>
        <div className="hidden justify-end gap-1 pt-1 group-hover:flex">
          <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(transaction)} aria-label="Редактировать транзакцию">
            <Edit3 className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => onDelete(transaction)} aria-label="Удалить транзакцию">
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

export function HistoryPage({ initialTransactions }: { initialTransactions: TransactionDTO[] }) {
  const router = useRouter();
  const [transactions, setTransactions] = useState(initialTransactions);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TransactionType | "ALL">("ALL");
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [visibleCount, setVisibleCount] = useState(80);
  const [pendingDelete, setPendingDelete] = useState<TransactionDTO | null>(null);
  const [editing, setEditing] = useState<TransactionDTO | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    return transactions.filter((transaction) => {
      const date = parseISO(transaction.date);
      const matchesSearch = transaction.description.toLowerCase().includes(query.trim().toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(transaction.category);
      const matchesType = type === "ALL" || transaction.type === type;
      return matchesSearch && matchesCategory && matchesType && sameOrAfter(date, startDate) && sameOrBefore(date, endDate);
    });
  }, [endDate, query, selectedCategories, startDate, transactions, type]);

  const visible = filtered.slice(0, visibleCount);
  const flatItems = useMemo(() => groupTransactions(visible), [visible]);
  const useVirtual = flatItems.length > 100;
  const virtualizer = useVirtualizer({
    count: flatItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => (flatItems[index]?.kind === "header" ? 44 : 76),
    overscan: 8
  });

  const expenseSum = filtered.filter((transaction) => transaction.type === "EXPENSE").reduce((sum, transaction) => sum + transaction.amount, 0);
  const currency = filtered[0]?.currency ?? "RUB";

  function toggleCategory(category: Category) {
    setSelectedCategories((current) => (current.includes(category) ? current.filter((item) => item !== category) : [...current, category]));
  }

  async function deleteSelected() {
    if (!pendingDelete) {
      return;
    }

    const response = await fetch(`/api/transactions/${pendingDelete.id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Транзакция не удалена", { description: "Попробуйте повторить действие." });
      setPendingDelete(null);
      return;
    }

    setTransactions((current) => current.filter((transaction) => transaction.id !== pendingDelete.id));
    toast.success("Транзакция удалена", { description: "Сводка обновится при следующем открытии dashboard." });
    setPendingDelete(null);
    router.refresh();
  }

  async function saveEdit() {
    if (!editing) {
      return;
    }

    const response = await fetch(`/api/transactions/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: editing.amount,
        description: editing.description,
        category: editing.category,
        type: editing.type,
        currency: editing.currency,
        date: editing.date,
        confidence: editing.confidence ?? undefined
      })
    });

    if (!response.ok) {
      toast.error("Правки не сохранены");
      return;
    }

    const payload = (await response.json()) as { transaction: TransactionDTO };
    setTransactions((current) => current.map((transaction) => (transaction.id === payload.transaction.id ? payload.transaction : transaction)));
    setEditing(null);
    toast.success("Транзакция обновлена");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="font-display text-2xl">История</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} транзакций, сумма расходов <span className="money text-foreground">{formatMoney(expenseSum, currency)}</span>
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_10rem_10rem_9rem]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по описанию" aria-label="Поиск по описанию" />
          </div>
          <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} aria-label="Начало периода" />
          <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} aria-label="Конец периода" />
          <Select value={type} onValueChange={(value) => setType(value as TransactionType | "ALL")}>
            <SelectTrigger aria-label="Тип транзакций">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Все</SelectItem>
              <SelectItem value="EXPENSE">Расход</SelectItem>
              <SelectItem value="INCOME">Доход</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="flex gap-2 overflow-x-auto pb-1" aria-label="Фильтр по категориям">
        {categoryValues.map((category) => {
          const active = selectedCategories.includes(category);
          return (
            <button
              key={category}
              type="button"
              onClick={() => toggleCategory(category)}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors",
                active ? categoryMeta[category].softColor : "border-border bg-surface text-muted-foreground hover:bg-secondary"
              )}
            >
              {categoryMeta[category].label}
            </button>
          );
        })}
      </section>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-80 flex-col items-center justify-center gap-4 text-center">
            <WalletCards className="h-12 w-12 text-primary" aria-hidden="true" />
            <div className="space-y-2">
              <h2 className="font-display text-xl">Здесь ничего не найдено</h2>
              <p className="max-w-md text-sm text-muted-foreground">
                Фильтры не совпали ни с одной транзакцией. Сбросьте период, категорию или поиск.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => {
                setQuery("");
                setSelectedCategories([]);
                setStartDate("");
                setEndDate("");
                setType("ALL");
              }}
            >
              Сбросить фильтры
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div ref={parentRef} className={cn(useVirtual && "h-[720px] overflow-auto rounded-lg")}>
          {useVirtual ? (
            <div className="relative" style={{ height: virtualizer.getTotalSize() }}>
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const item = flatItems[virtualItem.index];
                if (!item) {
                  return null;
                }
                return (
                  <div
                    key={item.id}
                    className="absolute left-0 top-0 w-full"
                    style={{ transform: `translateY(${virtualItem.start}px)` }}
                  >
                    {item.kind === "header" ? (
                      <div className="sticky top-0 z-10 bg-background py-2 text-sm font-medium text-muted-foreground">{item.label}</div>
                    ) : (
                      <TransactionRow transaction={item.transaction} onDelete={setPendingDelete} onEdit={setEditing} />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {flatItems.map((item) =>
                  item.kind === "header" ? (
                    <div key={item.id} className="sticky top-16 z-10 bg-background py-2 text-sm font-medium text-muted-foreground">
                      {item.label}
                    </div>
                  ) : (
                    <TransactionRow key={item.id} transaction={item.transaction} onDelete={setPendingDelete} onEdit={setEditing} />
                  )
                )}
              </AnimatePresence>
              {filtered.length > visibleCount && (
                <div className="space-y-2" role="status" aria-live="polite">
                  <Skeleton className="h-16" />
                  <Button type="button" variant="outline" className="w-full" onClick={() => setVisibleCount((count) => count + 40)}>
                    Показать еще
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить транзакцию?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete ? `Будет удалена запись "${pendingDelete.description}" на сумму ${formatMoney(pendingDelete.amount, pendingDelete.currency)}. Это действие нельзя отменить.` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={() => void deleteSelected()}>Удалить 1 транзакцию</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Редактировать транзакцию</AlertDialogTitle>
            <AlertDialogDescription>Правки сохраняются только после нажатия кнопки.</AlertDialogDescription>
          </AlertDialogHeader>
          {editing && (
            <div className="space-y-3">
              <Input value={editing.description} onChange={(event) => setEditing({ ...editing, description: event.target.value })} aria-label="Описание" />
              <Input
                value={editing.amount}
                type="number"
                onChange={(event) => setEditing({ ...editing, amount: Number(event.target.value) })}
                aria-label="Сумма"
              />
              <Select value={editing.category} onValueChange={(value) => setEditing({ ...editing, category: value as Category })}>
                <SelectTrigger aria-label="Категория">
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
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <Button type="button" onClick={() => void saveEdit()}>
              Сохранить правки
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
