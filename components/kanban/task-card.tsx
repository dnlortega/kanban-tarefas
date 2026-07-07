"use client";

import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarClock, GripVertical, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TaskAvatar } from "@/components/kanban/task-avatar";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import type { Task } from "@/types/task";

interface TaskCardProps {
  task: Task;
  isDoneColumn: boolean;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  overlay?: boolean;
}

function TaskCardImpl({ task, isDoneColumn, onEdit, onDelete, overlay }: TaskCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "task", columnId: task.columnId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const overdue = isOverdue(task.dueDate, isDoneColumn);

  return (
    <Card
      ref={overlay ? undefined : setNodeRef}
      style={overlay ? undefined : style}
      className={cn(
        "group animate-in fade-in slide-in-from-bottom-1 gap-0 py-0 duration-300 transition-shadow hover:shadow-md",
        isDragging && "opacity-40",
        overlay && "rotate-2 shadow-lg"
      )}
    >
      <CardContent className="flex items-start gap-2 p-3">
        <button
          type="button"
          className="mt-0.5 cursor-grab touch-none text-muted-foreground/50 active:cursor-grabbing hover:text-muted-foreground"
          aria-label="Arrastar tarefa"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium leading-tight">
            {task.title}
          </p>
          {task.description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {task.description}
            </p>
          )}

          {(task.assignee || task.dueDate) && (
            <div className="mt-2 flex items-center gap-2">
              {task.assignee && (
                <div className="flex items-center gap-1">
                  <TaskAvatar name={task.assignee} />
                  <span className="text-xs text-muted-foreground">
                    {task.assignee}
                  </span>
                </div>
              )}
              {task.dueDate && (
                <span
                  className={cn(
                    "ml-auto inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                    overdue
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <CalendarClock className="size-3" />
                  {formatDate(task.dueDate)}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Editar tarefa"
            onClick={() => onEdit(task)}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Excluir tarefa"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export const TaskCard = memo(TaskCardImpl);
