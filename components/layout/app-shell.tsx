"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, History, Lightbulb, Plus, Settings } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { QuickAddDialog } from "@/features/transactions/quick-add-dialog";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/history", label: "History", icon: History },
  { href: "/insights", label: "Insights", icon: Lightbulb },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-baseline gap-2" aria-label="Finley dashboard">
              <span className="font-display text-2xl">Finley</span>
              <span className="hidden text-xs text-muted-foreground sm:inline">AI finance tracker</span>
            </Link>
            <nav className="hidden items-center gap-1 md:flex" aria-label="Основная навигация">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                      active && "bg-secondary text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 pb-32 sm:px-6 sm:py-8 lg:px-8">{children}</main>

        <nav
          className="safe-bottom fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface md:hidden"
          aria-label="Мобильная навигация"
        >
          <div className="grid grid-cols-4 gap-1 px-2 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium text-muted-foreground transition-colors",
                    active && "bg-secondary text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {pathname === "/" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="lg"
                className="fixed bottom-24 right-4 z-50 h-14 rounded-full px-5 shadow-lg md:bottom-8 md:right-8"
                onClick={() => setQuickAddOpen(true)}
                aria-label="Добавить транзакцию"
              >
                <Plus className="h-5 w-5" aria-hidden="true" />
                <span>Добавить</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Добавить транзакцию</TooltipContent>
          </Tooltip>
        )}

        <QuickAddDialog open={quickAddOpen} onOpenChange={setQuickAddOpen} />
      </div>
    </TooltipProvider>
  );
}
