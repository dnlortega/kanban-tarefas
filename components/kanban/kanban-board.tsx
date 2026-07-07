"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Plus, Search, Settings, X } from "lucide-react";
import { toast } from "sonner";

import { Column } from "@/components/kanban/column";
import { TaskCard } from "@/components/kanban/task-card";
import { TaskDialog } from "@/components/kanban/task-dialog";
import { StatsBar } from "@/components/kanban/stats-bar";
import { EmailSummaryButton } from "@/components/kanban/email-summary-button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  createTask,
  deleteTask,
  syncColumnsOrder,
  updateTask,
} from "@/lib/actions/tasks";
import { isOverdue } from "@/lib/utils";
import type { ColumnWithTasks, Task, TaskInput } from "@/types/task";

interface KanbanBoardProps {
  initialColumns: ColumnWithTasks[];
  titleSuggestions: string[];
}

const ALL_ASSIGNEES = "__all__";

export function KanbanBoard({ initialColumns, titleSuggestions }: KanbanBoardProps) {
  const [columns, setColumns] = useState<ColumnWithTasks[]>(initialColumns);
  const [, startTransition] = useTransition();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [dialogColumnId, setDialogColumnId] = useState(columns[0]?.id ?? "");
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);
  const taskToDelete = taskToDeleteId
    ? columns.flatMap((c) => c.tasks).find((t) => t.id === taskToDeleteId) ?? null
    : null;

  const [search, setSearch] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState<string | null>(null);
  const isFiltering = search.trim().length > 0 || assigneeFilter !== null;

  const assigneeOptions = useMemo(() => {
    const names = columns
      .flatMap((c) => c.tasks)
      .map((t) => t.assignee)
      .filter((a): a is string => Boolean(a));
    return Array.from(new Set(names)).sort();
  }, [columns]);

  const filteredColumns = useMemo(() => {
    if (!isFiltering) return columns;
    const query = search.trim().toLowerCase();
    return columns.map((c) => ({
      ...c,
      tasks: c.tasks.filter((t) => {
        const matchesQuery =
          !query ||
          t.title.toLowerCase().includes(query) ||
          (t.description?.toLowerCase().includes(query) ?? false);
        const matchesAssignee = !assigneeFilter || t.assignee === assigneeFilter;
        return matchesQuery && matchesAssignee;
      }),
    }));
  }, [columns, isFiltering, search, assigneeFilter]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const stats = useMemo(() => {
    const allTasks = columns.flatMap((c) => c.tasks);
    const completed = columns
      .filter((c) => c.isDone)
      .flatMap((c) => c.tasks).length;
    const overdue = columns.flatMap((c) =>
      c.tasks.filter((t) => isOverdue(t.dueDate, c.isDone))
    ).length;
    return { total: allTasks.length, completed, overdue };
  }, [columns]);

  function findColumnId(id: string): string | undefined {
    if (columns.some((c) => c.id === id)) return id;
    return columns.find((c) => c.tasks.some((t) => t.id === id))?.id;
  }

  function handleDragStart(event: DragStartEvent) {
    const columnId = findColumnId(event.active.id as string);
    const column = columns.find((c) => c.id === columnId);
    const task = column?.tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const activeColumnId = findColumnId(activeId);
    const overColumnId = findColumnId(overId);
    if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) {
      return;
    }

    setColumns((prev) => {
      const activeCol = prev.find((c) => c.id === activeColumnId)!;
      const overCol = prev.find((c) => c.id === overColumnId)!;
      const activeTaskItem = activeCol.tasks.find((t) => t.id === activeId);
      if (!activeTaskItem) return prev;

      const overIndex = overCol.tasks.findIndex((t) => t.id === overId);
      let newIndex: number;
      if (overId === overColumnId) {
        newIndex = overCol.tasks.length;
      } else {
        const isBelow =
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;
        newIndex = overIndex >= 0 ? overIndex + (isBelow ? 1 : 0) : overCol.tasks.length;
      }

      return prev.map((c) => {
        if (c.id === activeColumnId) {
          return { ...c, tasks: c.tasks.filter((t) => t.id !== activeId) };
        }
        if (c.id === overColumnId) {
          const newTasks = [...c.tasks];
          newTasks.splice(newIndex, 0, {
            ...activeTaskItem,
            columnId: overColumnId,
          });
          return { ...c, tasks: newTasks };
        }
        return c;
      });
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumnId = findColumnId(activeId);
    const overColumnId = findColumnId(overId);
    if (!activeColumnId || !overColumnId) return;

    let finalColumns = columns;

    if (activeColumnId === overColumnId) {
      const col = columns.find((c) => c.id === activeColumnId)!;
      const oldIndex = col.tasks.findIndex((t) => t.id === activeId);
      const newIndex = col.tasks.findIndex((t) => t.id === overId);
      if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(col.tasks, oldIndex, newIndex);
        finalColumns = columns.map((c) =>
          c.id === activeColumnId ? { ...c, tasks: reordered } : c
        );
        setColumns(finalColumns);
      }
    }

    const affectedColumnIds = new Set([activeColumnId, overColumnId]);
    const payload = finalColumns
      .filter((c) => affectedColumnIds.has(c.id))
      .map((c) => ({ columnId: c.id, taskIds: c.tasks.map((t) => t.id) }));

    startTransition(() => {
      syncColumnsOrder(payload).catch(() => {
        toast.error("Erro ao salvar a nova ordem");
      });
    });
  }

  const openCreateDialog = useCallback((columnId: string) => {
    setEditingTask(null);
    setDialogColumnId(columnId);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((task: Task) => {
    setEditingTask(task);
    setDialogColumnId(task.columnId);
    setDialogOpen(true);
  }, []);

  function handleSubmit(input: TaskInput) {
    if (editingTask) {
      const id = editingTask.id;
      setColumns((prev) =>
        prev.map((c) => {
          const withoutTask = c.tasks.filter((t) => t.id !== id);
          if (c.id === input.columnId) {
            const updated: Task = {
              ...editingTask,
              title: input.title,
              description: input.description ?? null,
              assignee: input.assignee ?? null,
              dueDate: input.dueDate ?? null,
              columnId: input.columnId,
            };
            return c.id === editingTask.columnId
              ? { ...c, tasks: c.tasks.map((t) => (t.id === id ? updated : t)) }
              : { ...c, tasks: [...withoutTask, updated] };
          }
          return { ...c, tasks: withoutTask };
        })
      );
      startTransition(() => {
        updateTask(id, input).catch(() => toast.error("Erro ao atualizar tarefa"));
      });
      toast.success("Tarefa atualizada");
    } else {
      const tempId = `temp-${Date.now()}`;
      const optimisticTask: Task = {
        id: tempId,
        title: input.title,
        description: input.description ?? null,
        assignee: input.assignee ?? null,
        dueDate: input.dueDate ?? null,
        columnId: input.columnId,
        order: 9999,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setColumns((prev) =>
        prev.map((c) =>
          c.id === input.columnId
            ? { ...c, tasks: [...c.tasks, optimisticTask] }
            : c
        )
      );
      startTransition(() => {
        createTask(input).catch(() => toast.error("Erro ao criar tarefa"));
      });
      toast.success("Tarefa criada");
    }
  }

  const requestDelete = useCallback((id: string) => {
    setTaskToDeleteId(id);
  }, []);

  const confirmDelete = useCallback(() => {
    const id = taskToDeleteId;
    if (!id) return;
    setColumns((prev) => {
      const columnId = prev.find((c) => c.tasks.some((t) => t.id === id))?.id;
      if (!columnId) return prev;
      return prev.map((c) =>
        c.id === columnId
          ? { ...c, tasks: c.tasks.filter((t) => t.id !== id) }
          : c
      );
    });
    startTransition(() => {
      deleteTask(id).catch(() => toast.error("Erro ao excluir tarefa"));
    });
    toast("Tarefa excluída");
  }, [taskToDeleteId]);

  return (
    <>
      <div className="flex flex-col gap-4 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Quadro Kanban
            </h1>
            <p className="text-sm text-muted-foreground">
              Organize suas tarefas arrastando entre as colunas.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <EmailSummaryButton columns={columns} />
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Administrar colunas"
                    nativeButton={false}
                    render={<Link href="/admin" />}
                  />
                }
              >
                <Settings className="size-4" />
              </TooltipTrigger>
              <TooltipContent>Administrar colunas</TooltipContent>
            </Tooltip>
            <ThemeToggle />
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    size="icon"
                    aria-label="Nova tarefa"
                    onClick={() => openCreateDialog(columns[0]?.id ?? "")}
                    disabled={columns.length === 0}
                  />
                }
              >
                <Plus className="size-4" />
              </TooltipTrigger>
              <TooltipContent>Nova tarefa</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <StatsBar {...stats} />

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título ou descrição"
              className="pl-8"
            />
          </div>
          <Select
            items={[
              { value: ALL_ASSIGNEES, label: "Todos os responsáveis" },
              ...assigneeOptions.map((name) => ({ value: name, label: name })),
            ]}
            value={assigneeFilter ?? ALL_ASSIGNEES}
            onValueChange={(value) =>
              setAssigneeFilter(value === ALL_ASSIGNEES ? null : value)
            }
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_ASSIGNEES}>Todos os responsáveis</SelectItem>
              {assigneeOptions.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isFiltering && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Limpar filtros"
                    onClick={() => {
                      setSearch("");
                      setAssigneeFilter(null);
                    }}
                  />
                }
              >
                <X className="size-4" />
              </TooltipTrigger>
              <TooltipContent>Limpar filtros</TooltipContent>
            </Tooltip>
          )}
        </div>

        <DndContext
          id="kanban-board"
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-x-auto pb-2 sm:flex-row">
            {filteredColumns.map((col) => (
              <Column
                key={col.id}
                column={col}
                tasks={col.tasks}
                totalCount={
                  columns.find((c) => c.id === col.id)?.tasks.length ?? 0
                }
                dragDisabled={isFiltering}
                onAddTask={openCreateDialog}
                onEditTask={openEditDialog}
                onDeleteTask={requestDelete}
              />
            ))}
            {columns.length === 0 && (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhuma coluna configurada ainda.
                </p>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        aria-label="Criar primeira coluna"
                        nativeButton={false}
                        render={<Link href="/admin" />}
                      />
                    }
                  >
                    <Settings className="size-4" />
                  </TooltipTrigger>
                  <TooltipContent>Criar primeira coluna</TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>

          <DragOverlay>
            {activeTask && (
              <TaskCard
                task={activeTask}
                isDoneColumn={
                  columns.find((c) => c.id === activeTask.columnId)?.isDone ?? false
                }
                onEdit={() => {}}
                onDelete={() => {}}
                overlay
              />
            )}
          </DragOverlay>
        </DndContext>
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        defaultColumnId={dialogColumnId}
        columns={columns}
        titleSuggestions={titleSuggestions}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={taskToDeleteId !== null}
        onOpenChange={(open) => !open && setTaskToDeleteId(null)}
        title="Excluir tarefa"
        description={
          taskToDelete
            ? `Tem certeza que deseja excluir "${taskToDelete.title}"? Essa ação não pode ser desfeita.`
            : ""
        }
        confirmLabel="Excluir"
        onConfirm={confirmDelete}
      />
    </>
  );
}
