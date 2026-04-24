"use client";

import { CircleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Card>
      <CardContent className="flex min-h-80 flex-col items-center justify-center gap-4 text-center">
        <CircleAlert className="h-10 w-10 text-destructive" aria-hidden="true" />
        <div className="space-y-2">
          <h2 className="font-display text-xl">Данные не загрузились</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Finley не смог получить финансовую сводку. Повторите попытку, данные не изменены.
          </p>
        </div>
        <Button type="button" onClick={reset}>
          Повторить
        </Button>
      </CardContent>
    </Card>
  );
}
