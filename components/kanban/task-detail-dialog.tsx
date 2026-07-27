"use client";

import { CalendarClock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskAvatar } from "@/components/kanban/task-avatar";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import type { Task } from "@/types/task";

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  columnTitle: string;
  isDoneColumn: boolean;
}

export function TaskDetailDialog({
  open,
  onOpenChange,
  task,
  columnTitle,
  isDoneColumn,
}: TaskDetailDialogProps) {
  if (!task) return null;

  const overdue = isOverdue(task.dueDate, isDoneColumn);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription>Status: {columnTitle}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {task.description && (
            <div className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {task.description}
              </ReactMarkdown>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 text-sm">
            {task.assignee && (
              <div className="flex items-center gap-1.5">
                <TaskAvatar name={task.assignee.name} />
                <span>{task.assignee.name}</span>
              </div>
            )}
            {task.dueDate && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  overdue
                    ? "bg-destructive/10 text-destructive"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <CalendarClock className="size-3.5" />
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Só o coordenador pode editar os detalhes. Arraste o card no quadro para mudar a
            situação.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
