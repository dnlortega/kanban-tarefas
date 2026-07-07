"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { COLUMNS } from "@/types/task";
import type { Task, TaskInput, TaskStatus } from "@/types/task";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  defaultStatus: TaskStatus;
  onSubmit: (input: TaskInput) => void;
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  defaultStatus,
  onSubmit,
}: TaskDialogProps) {
  const isEditing = Boolean(task);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar tarefa" : "Nova tarefa"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os detalhes da tarefa."
              : "Preencha as informações para criar uma nova tarefa."}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <TaskForm
            task={task}
            defaultStatus={defaultStatus}
            isEditing={isEditing}
            onCancel={() => onOpenChange(false)}
            onSubmit={(input) => {
              onSubmit(input);
              onOpenChange(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface TaskFormProps {
  task: Task | null;
  defaultStatus: TaskStatus;
  isEditing: boolean;
  onCancel: () => void;
  onSubmit: (input: TaskInput) => void;
}

function TaskForm({
  task,
  defaultStatus,
  isEditing,
  onCancel,
  onSubmit,
}: TaskFormProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? defaultStatus);

  const canSubmit = title.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      status,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-2">
        <div className="grid gap-1.5">
          <Label htmlFor="task-title">Título</Label>
          <Input
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Revisar proposta comercial"
            autoFocus
            required
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="task-description">Descrição (opcional)</Label>
          <Textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalhes adicionais sobre a tarefa"
            rows={3}
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="task-status">Status</Label>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as TaskStatus)}
          >
            <SelectTrigger id="task-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COLUMNS.map((col) => (
                <SelectItem key={col.id} value={col.id}>
                  {col.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {isEditing ? "Salvar alterações" : "Criar tarefa"}
        </Button>
      </DialogFooter>
    </form>
  );
}
