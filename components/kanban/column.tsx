"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ColumnDefinition, Task } from "@/types/task";
import { TaskCard } from "@/components/kanban/task-card";

interface ColumnProps {
  column: ColumnDefinition;
  tasks: Task[];
  onAddTask: (status: ColumnDefinition["id"]) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

const DOT_STYLES: Record<ColumnDefinition["id"], string> = {
  todo: "bg-muted-foreground/50",
  doing: "bg-amber-500",
  done: "bg-emerald-500",
};

export function Column({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", status: column.id },
  });

  return (
    <div className="flex h-full min-h-0 w-full flex-col rounded-xl border bg-muted/30 sm:w-80 sm:shrink-0">
      <div className="flex items-center justify-between gap-2 px-3 py-3">
        <div className="flex items-center gap-2">
          <span className={cn("size-2 rounded-full", DOT_STYLES[column.id])} />
          <h2 className="text-sm font-semibold">{column.title}</h2>
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {tasks.length}
          </span>
        </div>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label={`Adicionar tarefa em ${column.title}`}
          onClick={() => onAddTask(column.id)}
        >
          <Plus className="size-4" />
        </Button>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-24 flex-1 flex-col gap-2 overflow-y-auto rounded-lg p-2 pt-0 transition-colors",
          isOver && "bg-primary/5 ring-2 ring-primary/30 ring-inset"
        )}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed py-6 text-xs text-muted-foreground">
            Nenhuma tarefa
          </div>
        )}
      </div>
    </div>
  );
}
