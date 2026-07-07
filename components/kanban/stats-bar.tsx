import { AlertTriangle, CheckCircle2, ListTodo } from "lucide-react";

import { cn } from "@/lib/utils";

interface StatsBarProps {
  total: number;
  completed: number;
  overdue: number;
}

export function StatsBar({ total, completed, overdue }: StatsBarProps) {
  const items = [
    {
      label: "Total de tarefas",
      value: total,
      icon: ListTodo,
      accent: "text-foreground",
    },
    {
      label: "Concluídas",
      value: completed,
      icon: CheckCircle2,
      accent: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Atrasadas",
      value: overdue,
      icon: AlertTriangle,
      accent: overdue > 0 ? "text-destructive" : "text-muted-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item, index) => (
        <div
          key={item.label}
          style={{ animationDelay: `${index * 60}ms` }}
          className="flex animate-in items-center gap-3 rounded-xl border bg-card px-4 py-3 fade-in slide-in-from-bottom-1 fill-mode-both transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
        >
          <item.icon className={cn("size-5 shrink-0", item.accent)} />
          <div className="min-w-0">
            <p className={cn("text-lg font-semibold leading-none", item.accent)}>
              {item.value}
            </p>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {item.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
