"use client";

import {
  Area,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import type { CategoryTotal, DailyPoint } from "@/lib/data";
import { formatCompactMoney, formatMoney } from "@/lib/utils";

export function CategoryDonut({ data, currency }: { data: CategoryTotal[]; currency: string }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
        Категории появятся после первой траты.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="total" nameKey="label" innerRadius={64} outerRadius={96} paddingAngle={3} cx="50%" cy="45%" isAnimationActive={false}>
            {data.map((entry) => (
              <Cell key={entry.category} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatMoney(Number(value), currency)} />
          <Legend iconType="circle" verticalAlign="bottom" height={40} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CashflowLine({ data, currency }: { data: DailyPoint[]; currency: string }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16a34a" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#71717a" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#71717a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} minTickGap={24} />
          <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => formatCompactMoney(Number(value), currency)} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} width={72} />
          <Tooltip formatter={(value) => formatMoney(Number(value), currency)} labelClassName="text-foreground" contentStyle={{ borderRadius: 8, borderColor: "hsl(var(--border))", background: "hsl(var(--surface))" }} />
          <Area type="monotone" dataKey="income" stroke="none" fill="url(#incomeFill)" legendType="none" isAnimationActive={false} />
          <Area type="monotone" dataKey="expense" stroke="none" fill="url(#expenseFill)" legendType="none" isAnimationActive={false} />
          <Line type="monotone" dataKey="income" name="Доходы" stroke="#16a34a" strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
          <Line type="monotone" dataKey="expense" name="Расходы" stroke="#71717a" strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
          <Legend />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
