"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Check, ChevronsUpDown, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn, formatDate } from "@/lib/utils";
import type { Column, Task, TaskAssignee, TaskInput, Label } from "@/types/task";

const UNASSIGNED = "__unassigned__";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  defaultColumnId: string;
  columns: Column[];
  assignableUsers: TaskAssignee[];
  availableLabels: Label[];
  titleSuggestions: string[];
  onSubmit: (input: TaskInput) => void;
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  defaultColumnId,
  columns,
  assignableUsers,
  availableLabels,
  titleSuggestions,
  onSubmit,
}: TaskDialogProps) {
  const isEditing = Boolean(task);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
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
            defaultColumnId={defaultColumnId}
            columns={columns}
            assignableUsers={assignableUsers}
            availableLabels={availableLabels}
            titleSuggestions={titleSuggestions}
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
  defaultColumnId: string;
  columns: Column[];
  assignableUsers: TaskAssignee[];
  availableLabels: Label[];
  titleSuggestions: string[];
  isEditing: boolean;
  onCancel: () => void;
  onSubmit: (input: TaskInput) => void;
}

function TaskForm({
  task,
  defaultColumnId,
  columns,
  assignableUsers,
  availableLabels,
  titleSuggestions,
  isEditing,
  onCancel,
  onSubmit,
}: TaskFormProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [titlePopoverOpen, setTitlePopoverOpen] = useState(false);
  const [description, setDescription] = useState(task?.description ?? "");
  const [assigneeId, setAssigneeId] = useState(task?.assignee?.id ?? UNASSIGNED);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task?.dueDate ? new Date(task.dueDate) : undefined
  );
  const [dueDatePopoverOpen, setDueDatePopoverOpen] = useState(false);
  const [columnId, setColumnId] = useState(task?.columnId ?? defaultColumnId);
  const [labelIds, setLabelIds] = useState<string[]>(
    task?.labels?.map((l) => l.id) ?? []
  );

  const canSubmit = title.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      assigneeId: assigneeId === UNASSIGNED ? undefined : assigneeId,
      dueDate: dueDate ? dueDate.toISOString() : undefined,
      columnId,
      labelIds,
    });
  }

  const filteredSuggestions = titleSuggestions.filter((s) =>
    s.toLowerCase().includes(title.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-2">
        <div className="grid gap-1.5">
          <Label htmlFor="task-title">Título</Label>
          <Popover open={titlePopoverOpen} onOpenChange={setTitlePopoverOpen}>
            <PopoverTrigger asChild>
              <div className="relative">
                <Input
                  id="task-title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setTitlePopoverOpen(e.target.value.length > 0);
                  }}
                  onFocus={() => title.length > 0 && setTitlePopoverOpen(true)}
                  placeholder="Ex: Revisar proposta comercial"
                  autoComplete="off"
                  autoFocus
                  required
                />
                {titleSuggestions.length > 0 && (
                  <ChevronsUpDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/50" />
                )}
              </div>
            </PopoverTrigger>
            {filteredSuggestions.length > 0 && (
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                  <CommandList>
                    <CommandEmpty>Nenhuma sugestão</CommandEmpty>
                    <CommandGroup heading="Usadas antes">
                      {filteredSuggestions.map((suggestion) => (
                        <CommandItem
                          key={suggestion}
                          value={suggestion}
                          onSelect={(value) => {
                            setTitle(value);
                            setTitlePopoverOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "size-3.5",
                              suggestion === title ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {suggestion}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            )}
          </Popover>
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

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="task-assignee">Responsável (opcional)</Label>
            <Select
              value={assigneeId}
              onValueChange={(value) => value && setAssigneeId(value)}
            >
              <SelectTrigger id="task-assignee" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNASSIGNED}>Sem responsável</SelectItem>
                {assignableUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="task-due-date">Prazo (opcional)</Label>
            <Popover open={dueDatePopoverOpen} onOpenChange={setDueDatePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  id="task-due-date"
                  variant="outline"
                  className="justify-start font-normal"
                >
                  <CalendarIcon className="size-3.5" />
                  {dueDate ? formatDate(dueDate) : "Selecionar"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => {
                    setDueDate(date);
                    setDueDatePopoverOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label>Etiquetas</Label>
          <div className="flex flex-wrap gap-1.5">
            {availableLabels.map((label) => {
              const isSelected = labelIds.includes(label.id);
              return (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => {
                    setLabelIds((prev) => 
                      isSelected ? prev.filter((id) => id !== label.id) : [...prev, label.id]
                    );
                  }}
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    isSelected ? "ring-2 ring-ring ring-offset-2 ring-offset-background" : "hover:bg-muted/50 opacity-60 hover:opacity-100"
                  )}
                  style={{ 
                    backgroundColor: isSelected ? `${label.color}20` : "transparent", 
                    color: isSelected ? label.color : "inherit",
                    borderColor: isSelected ? `${label.color}50` : "var(--border)"
                  }}
                >
                  {label.name}
                </button>
              );
            })}
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border border-dashed hover:bg-muted/50 transition-colors opacity-60 hover:opacity-100 text-muted-foreground"
              onClick={() => {
                const name = prompt("Nome da nova etiqueta:");
                if (!name) return;
                const colors = ["#ef4444", "#f97316", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                
                fetch("/api/labels", {
                  method: "POST",
                  body: JSON.stringify({ name, color: randomColor })
                }).then(() => window.location.reload());
              }}
            >
              <Plus className="size-3" />
              Nova
            </button>
          </div>
        </div>

        {!isEditing && (
          <div className="grid gap-1.5">
            <Label htmlFor="task-status">Status inicial</Label>
            <Select
              value={columnId}
              onValueChange={(value) => value && setColumnId(value)}
            >
              <SelectTrigger id="task-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {columns.map((col) => (
                  <SelectItem key={col.id} value={col.id}>
                    {col.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {isEditing && (
          <p className="text-xs text-muted-foreground">
            A situação da tarefa só pode ser alterada pelo responsável, arrastando-a no
            quadro.
          </p>
        )}
      </div>

      <DialogFooter>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Cancelar"
              onClick={onCancel}
            >
              <X className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Cancelar</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="submit"
              size="icon"
              disabled={!canSubmit}
              aria-label={isEditing ? "Salvar alterações" : "Criar tarefa"}
            >
              <Check className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isEditing ? "Salvar alterações" : "Criar tarefa"}
          </TooltipContent>
        </Tooltip>
      </DialogFooter>
    </form>
  );
}
