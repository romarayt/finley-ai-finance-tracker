"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Download, FileText, Moon, Sun, Trash2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { settingsSchema, type SettingsDTO, type SettingsInput } from "@/features/transactions/types";

export function SettingsPage({ initialSettings }: { initialSettings: SettingsDTO }) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [clearOpen, setClearOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [pdfStart, setPdfStart] = useState("");
  const [pdfEnd, setPdfEnd] = useState("");
  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialSettings
  });

  async function saveSettings(values: SettingsInput) {
    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      toast.error("Настройки не сохранены", { description: "Проверьте бюджет и повторите." });
      return;
    }

    setTheme(values.theme);
    toast.success("Настройки сохранены", { description: "Новые параметры уже применены." });
    router.refresh();
  }

  async function downloadPdf() {
    const query = new URLSearchParams();
    if (pdfStart) {
      query.set("start", pdfStart);
    }
    if (pdfEnd) {
      query.set("end", pdfEnd);
    }
    const response = await fetch(`/api/export/pdf?${query.toString()}`);
    if (!response.ok) {
      toast.error("PDF не сформирован", { description: "Повторите экспорт чуть позже." });
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "finley-report.pdf";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("PDF отчет скачан");
  }

  async function clearData() {
    const response = await fetch("/api/transactions", { method: "DELETE" });
    if (!response.ok) {
      toast.error("Данные не очищены", { description: "Транзакции остались на месте." });
      return;
    }
    setClearOpen(false);
    setConfirmation("");
    toast.success("Все транзакции удалены", { description: "Можно начать месяц заново." });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="font-display text-2xl">Настройки</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Финансовые параметры и экспорт данных. Массовые действия требуют явного подтверждения.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Бюджет и интерфейс</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={form.handleSubmit(saveSettings)}>
              <div className="space-y-2">
                <Label htmlFor="monthlyBudget">Месячный бюджет</Label>
                <Input id="monthlyBudget" inputMode="numeric" {...form.register("monthlyBudget", { valueAsNumber: true })} />
                {form.formState.errors.monthlyBudget && <p className="text-xs text-destructive">{form.formState.errors.monthlyBudget.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Валюта</Label>
                <Controller
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger aria-label="Валюта">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RUB">RUB</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Тема</Label>
                <Controller
                  control={form.control}
                  name="theme"
                  render={({ field }) => (
                    <div className="grid gap-2 sm:grid-cols-3">
                      {[
                        { value: "light", label: "Light", icon: Sun },
                        { value: "dark", label: "Dark", icon: Moon },
                        { value: "system", label: "System", icon: Sun }
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => {
                              field.onChange(item.value);
                              setTheme(item.value);
                            }}
                            className={`flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors ${
                              field.value === item.value ? "border-primary bg-accent text-accent-foreground" : "border-border bg-surface hover:bg-secondary"
                            }`}
                          >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
              </div>

              <div className="sm:col-span-2">
                <Button type="submit">Сохранить настройки</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Экспорт</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild variant="outline" className="w-full justify-start">
              <a href="/api/export/csv">
                <Download className="h-4 w-4" aria-hidden="true" />
                Скачать CSV
              </a>
            </Button>

            <div className="space-y-2">
              <Label>Период PDF</Label>
              <div className="grid gap-2">
                <Input type="date" value={pdfStart} onChange={(event) => setPdfStart(event.target.value)} aria-label="Начало PDF отчета" />
                <Input type="date" value={pdfEnd} onChange={(event) => setPdfEnd(event.target.value)} aria-label="Конец PDF отчета" />
              </div>
            </div>

            <Button type="button" variant="outline" className="w-full justify-start" onClick={() => void downloadPdf()}>
              <FileText className="h-4 w-4" aria-hidden="true" />
              Скачать PDF отчет
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle>Опасная зона</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm text-muted-foreground">
            Очистка удалит все транзакции, но оставит бюджет и тему. Finley попросит точное подтверждение.
          </p>
          <Button type="button" variant="destructive" onClick={() => setClearOpen(true)}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Очистить все данные
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить все транзакции?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие удалит историю расходов и доходов. Чтобы продолжить, введите УДАЛИТЬ.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="clear-confirm">Подтверждение</Label>
            <Input id="clear-confirm" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="УДАЛИТЬ" />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction disabled={confirmation !== "УДАЛИТЬ"} onClick={() => void clearData()}>
              Удалить все транзакции
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
