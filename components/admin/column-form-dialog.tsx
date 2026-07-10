"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Column } from "@/types/task";

const COLOR_PRESETS = [
  "#71717a", "#f59e0b", "#10b981", "#3b82f6",
  "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4",
];

interface ColumnFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  column: Column | null;
  onSubmit: (input: { title: string; color: string; isDone: boolean }) => void;
}

export function ColumnFormDialog({
  open,
  onOpenChange,
  column,
  onSubmit,
}: ColumnFormDialogProps) {
  const isEditing = Boolean(column);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar coluna" : "Nova coluna"}</DialogTitle>
          <DialogDescription>
            Colunas representam os status que as tarefas podem ter no quadro.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <ColumnForm
            column={column}
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

function ColumnForm({
  column,
  isEditing,
  onCancel,
  onSubmit,
}: {
  column: Column | null;
  isEditing: boolean;
  onCancel: () => void;
  onSubmit: (input: { title: string; color: string; isDone: boolean }) => void;
}) {
  const [title, setTitle] = useState(column?.title ?? "");
  const [color, setColor] = useState(column?.color ?? COLOR_PRESETS[0]);
  const [isDone, setIsDone] = useState(column?.isDone ?? false);

  const canSubmit = title.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ title: title.trim(), color, isDone });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-2">
        <div className="grid gap-1.5">
          <Label htmlFor="column-title">Título</Label>
          <Input
            id="column-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Em revisão"
            autoFocus
            required
          />
        </div>

        <div className="grid gap-1.5">
          <Label>Cor</Label>
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                aria-label={`Selecionar cor ${preset}`}
                onClick={() => setColor(preset)}
                className={cn(
                  "size-7 rounded-full ring-offset-2 ring-offset-background transition-all",
                  color === preset && "ring-2 ring-foreground"
                )}
                style={{ backgroundColor: preset }}
              />
            ))}
          </div>
        </div>

        <Label className="flex items-center gap-2 text-sm font-normal">
          <Checkbox
            checked={isDone}
            onCheckedChange={(checked) => setIsDone(checked === true)}
          />
          Marcar como coluna de conclusão (conta nas estatísticas)
        </Label>
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
              aria-label={isEditing ? "Salvar alterações" : "Criar coluna"}
            >
              <Check className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isEditing ? "Salvar alterações" : "Criar coluna"}
          </TooltipContent>
        </Tooltip>
      </DialogFooter>
    </form>
  );
}
