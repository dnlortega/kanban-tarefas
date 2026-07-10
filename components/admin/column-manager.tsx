"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, CheckCircle2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  createColumn,
  deleteColumn,
  moveColumn,
  updateColumn,
} from "@/lib/actions/columns";
import { ColumnFormDialog } from "@/components/admin/column-form-dialog";
import type { Column } from "@/types/task";

interface ColumnManagerProps {
  initialColumns: (Column & { taskCount: number })[];
}

export function ColumnManager({ initialColumns }: ColumnManagerProps) {
  const [columns, setColumns] = useState(initialColumns);
  const [, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Column | null>(null);
  const [columnToDelete, setColumnToDelete] = useState<
    (Column & { taskCount: number }) | null
  >(null);

  function handleMove(id: string, direction: "up" | "down") {
    const index = columns.findIndex((c) => c.id === id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= columns.length) return;

    const next = [...columns];
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    setColumns(next);

    startTransition(() => {
      moveColumn(id, direction).catch(() => toast.error("Erro ao reordenar"));
    });
  }

  function requestDelete(column: Column & { taskCount: number }) {
    if (column.taskCount > 0) {
      toast.error(
        "Mova ou exclua as tarefas dessa coluna antes de removê-la."
      );
      return;
    }
    setColumnToDelete(column);
  }

  function confirmDeleteColumn() {
    if (!columnToDelete) return;
    const column = columnToDelete;
    setColumns((prev) => prev.filter((c) => c.id !== column.id));
    startTransition(() => {
      deleteColumn(column.id)
        .then(() => toast.success("Coluna removida"))
        .catch((err) => toast.error(err.message || "Erro ao remover coluna"));
    });
  }

  function handleSubmit(input: { title: string; color: string; isDone: boolean }) {
    if (editing) {
      setColumns((prev) =>
        prev.map((c) => (c.id === editing.id ? { ...c, ...input } : c))
      );
      startTransition(() => {
        updateColumn(editing.id, input).catch(() =>
          toast.error("Erro ao atualizar coluna")
        );
      });
      toast.success("Coluna atualizada");
    } else {
      startTransition(async () => {
        try {
          const created = await createColumn(input);
          setColumns((prev) => [...prev, created]);
          toast.success("Coluna criada");
        } catch {
          toast.error("Erro ao criar coluna");
        }
      });
    }
  }

  return (
    <>
      <div className="flex justify-end">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              aria-label="Nova coluna"
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Nova coluna</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex flex-col gap-2 md:hidden">
        {columns.map((column, index) => (
          <Card key={column.id}>
            <CardContent className="flex flex-col gap-3 p-3">
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: column.color }}
                />
                <span className="min-w-0 flex-1 truncate font-medium">
                  {column.title}
                </span>
                {column.isDone && (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                )}
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-xs",
                    column.taskCount > 0
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {column.taskCount} tarefas
                </span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    disabled={index === 0}
                    onClick={() => handleMove(column.id, "up")}
                    aria-label="Mover para cima"
                  >
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    disabled={index === columns.length - 1}
                    onClick={() => handleMove(column.id, "down")}
                    aria-label="Mover para baixo"
                  >
                    <ArrowDown className="size-3.5" />
                  </Button>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Editar coluna"
                    onClick={() => {
                      setEditing(column);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Excluir coluna"
                    onClick={() => requestDelete(column)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {columns.length === 0 && (
          <p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
            Nenhuma coluna criada ainda.
          </p>
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Título</TableHead>
              <TableHead>Cor</TableHead>
              <TableHead>Conclusão</TableHead>
              <TableHead>Tarefas</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {columns.map((column, index) => (
              <TableRow key={column.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      disabled={index === 0}
                      onClick={() => handleMove(column.id, "up")}
                      aria-label="Mover para cima"
                    >
                      <ArrowUp className="size-3" />
                    </Button>
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      disabled={index === columns.length - 1}
                      onClick={() => handleMove(column.id, "down")}
                      aria-label="Mover para baixo"
                    >
                      <ArrowDown className="size-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: column.color }}
                    />
                    {column.title}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">
                    {column.color}
                  </span>
                </TableCell>
                <TableCell>
                  {column.isDone && (
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs",
                      column.taskCount > 0
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {column.taskCount}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Editar coluna"
                      onClick={() => {
                        setEditing(column);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Excluir coluna"
                      onClick={() => requestDelete(column)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {columns.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  Nenhuma coluna criada ainda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ColumnFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        column={editing}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={columnToDelete !== null}
        onOpenChange={(open) => !open && setColumnToDelete(null)}
        title="Excluir coluna"
        description={
          columnToDelete
            ? `Tem certeza que deseja excluir a coluna "${columnToDelete.title}"? Essa ação não pode ser desfeita.`
            : ""
        }
        confirmLabel="Excluir"
        onConfirm={confirmDeleteColumn}
      />
    </>
  );
}
