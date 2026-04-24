import * as React from "react";

import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  tone?: "success" | "warning" | "danger" | "neutral";
}

export function Progress({ className, value, tone = "success", ...props }: ProgressProps) {
  const color = {
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-destructive",
    neutral: "bg-muted-foreground"
  }[tone];

  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-secondary", className)} {...props}>
      <div className={cn("h-full rounded-full transition-all duration-300", color)} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}
