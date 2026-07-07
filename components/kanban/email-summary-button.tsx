"use client";

import { Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate } from "@/lib/utils";
import type { ColumnWithTasks } from "@/types/task";

interface EmailSummaryButtonProps {
  columns: ColumnWithTasks[];
}

export function EmailSummaryButton({ columns }: EmailSummaryButtonProps) {
  const doneColumns = columns.filter((c) => c.isDone);
  const completedTasks = doneColumns.flatMap((c) => c.tasks);

  function handleSend() {
    if (completedTasks.length === 0) {
      toast.error("Nenhuma tarefa concluída para enviar ainda.");
      return;
    }

    const subject = `Tarefas concluídas (${completedTasks.length})`;
    const lines = completedTasks.map((task, index) => {
      const parts = [`${index + 1}. ${task.title}`];
      if (task.assignee) parts.push(`Responsável: ${task.assignee.name}`);
      if (task.description) parts.push(`Descrição: ${task.description}`);
      parts.push(`Concluída em: ${formatDate(task.updatedAt)}`);
      return parts.join("\n   ");
    });

    const body = [
      `Resumo das tarefas concluídas:`,
      "",
      ...lines.map((l) => l + "\n"),
    ].join("\n");

    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Enviar concluídas por e-mail"
            onClick={handleSend}
          />
        }
      >
        <Mail className="size-4" />
      </TooltipTrigger>
      <TooltipContent>Enviar concluídas por e-mail</TooltipContent>
    </Tooltip>
  );
}
