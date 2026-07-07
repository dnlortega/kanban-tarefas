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
      iconWrap: "bg-primary/10 text-primary",
      value_: "text-foreground",
    },
    {
      label: "Concluídas",
      value: completed,
      icon: CheckCircle2,
      iconWrap: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      value_: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Atrasadas",
      value: overdue,
      icon: AlertTriangle,
      iconWrap:
        overdue > 0
          ? "bg-destructive/10 text-destructive"
          : "bg-muted text-muted-foreground",
      value_: overdue > 0 ? "text-destructive" : "text-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item, index) => (
        <div
          key={item.label}
          style={{ animationDelay: `${index * 60}ms` }}
          className="flex animate-in items-center gap-3 rounded-xl border bg-card px-4 py-3 fade-in shadow-xs ring-1 ring-foreground/8 slide-in-from-bottom-1 fill-mode-both transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg",
              item.iconWrap
            )}
          >
            <item.icon className="size-4.5" />
          </div>
          <div className="min-w-0">
            <p className={cn("text-lg font-semibold leading-none", item.value_)}>
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
