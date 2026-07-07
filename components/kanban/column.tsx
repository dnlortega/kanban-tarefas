"use client";

import { memo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Column as ColumnType, Task } from "@/types/task";
import { TaskCard } from "@/components/kanban/task-card";

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  totalCount: number;
  dragDisabled?: boolean;
  isCoordinator: boolean;
  currentUserId: string;
  onAddTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

function ColumnImpl({
  column,
  tasks,
  totalCount,
  dragDisabled,
  isCoordinator,
  currentUserId,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", columnId: column.id },
  });

  const isFiltered = tasks.length !== totalCount;

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border bg-card shadow-xs ring-1 ring-foreground/8 sm:w-80 sm:shrink-0">
      <div
        className="h-1 shrink-0"
        style={{ backgroundColor: column.color }}
      />
      <div className="flex items-center justify-between gap-2 px-3 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: column.color }}
          />
          <h2 className="truncate text-sm font-semibold">{column.title}</h2>
          <span
            className="shrink-0 rounded-full px-1.5 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: `${column.color}1a`,
              color: column.color,
            }}
          >
            {isFiltered ? `${tasks.length}/${totalCount}` : totalCount}
          </span>
        </div>
        {isCoordinator && (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={`Adicionar tarefa em ${column.title}`}
            onClick={() => onAddTask(column.id)}
          >
            <Plus className="size-4" />
          </Button>
        )}
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-24 flex-1 flex-col gap-2 overflow-y-auto bg-muted/40 p-2 transition-colors",
          isOver && "bg-primary/10 ring-2 ring-primary/30 ring-inset"
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
              isDoneColumn={column.isDone}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              canManage={isCoordinator}
              dragDisabled={
                dragDisabled || (!isCoordinator && task.assignee?.id !== currentUserId)
              }
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed py-6 text-xs text-muted-foreground">
            {totalCount === 0 ? "Nenhuma tarefa" : "Nenhum resultado"}
          </div>
        )}
      </div>
    </div>
  );
}

export const Column = memo(ColumnImpl);
