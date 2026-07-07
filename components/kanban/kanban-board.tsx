"use client";

import { useMemo, useState } from "react";
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
import { toast } from "sonner";

import { Plus } from "lucide-react";

import { Column } from "@/components/kanban/column";
import { TaskCard } from "@/components/kanban/task-card";
import { TaskDialog } from "@/components/kanban/task-dialog";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useKanbanStore } from "@/lib/store";
import { COLUMNS } from "@/types/task";
import type { Task, TaskInput, TaskStatus } from "@/types/task";

export function KanbanBoard() {
  const tasksById = useKanbanStore((s) => s.tasksById);
  const columns = useKanbanStore((s) => s.columns);
  const addTask = useKanbanStore((s) => s.addTask);
  const updateTask = useKanbanStore((s) => s.updateTask);
  const deleteTask = useKanbanStore((s) => s.deleteTask);
  const setColumns = useKanbanStore((s) => s.setColumns);
  const moveTask = useKanbanStore((s) => s.moveTask);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [dialogStatus, setDialogStatus] = useState<TaskStatus>("todo");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const tasksByColumn = useMemo(() => {
    const result = {} as Record<TaskStatus, Task[]>;
    for (const col of COLUMNS) {
      result[col.id] = columns[col.id]
        .map((id) => tasksById[id])
        .filter(Boolean);
    }
    return result;
  }, [columns, tasksById]);

  function findContainer(id: string): TaskStatus | undefined {
    if (id in columns) return id as TaskStatus;
    return (Object.keys(columns) as TaskStatus[]).find((key) =>
      columns[key].includes(id)
    );
  }

  function handleDragStart(event: DragStartEvent) {
    const task = tasksById[event.active.id as string];
    setActiveTask(task ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);
    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    const overItems = columns[overContainer];
    const overIndex = overItems.indexOf(overId);

    let newIndex: number;
    if (overId in columns) {
      newIndex = overItems.length;
    } else {
      const isBelowOverItem =
        active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height;
      newIndex = overIndex >= 0 ? overIndex + (isBelowOverItem ? 1 : 0) : overItems.length;
    }

    moveTask(activeId, overContainer, newIndex);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);
    if (!activeContainer || !overContainer || activeContainer !== overContainer) {
      return;
    }

    const items = columns[activeContainer];
    const activeIndex = items.indexOf(activeId);
    const overIndex = items.indexOf(overId);

    if (activeIndex !== overIndex && activeIndex !== -1 && overIndex !== -1) {
      setColumns({
        ...columns,
        [activeContainer]: arrayMove(items, activeIndex, overIndex),
      });
    }
  }

  function openCreateDialog(status: TaskStatus) {
    setEditingTask(null);
    setDialogStatus(status);
    setDialogOpen(true);
  }

  function openEditDialog(task: Task) {
    setEditingTask(task);
    setDialogStatus(task.status);
    setDialogOpen(true);
  }

  function handleSubmit(input: TaskInput) {
    if (editingTask) {
      updateTask(editingTask.id, input);
      toast.success("Tarefa atualizada");
    } else {
      addTask(input);
      toast.success("Tarefa criada");
    }
  }

  function handleDelete(id: string) {
    deleteTask(id);
    toast("Tarefa excluída");
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 pb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Meu Kanban
          </h1>
          <p className="text-sm text-muted-foreground">
            Organize suas tarefas arrastando entre as colunas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button type="button" onClick={() => openCreateDialog("todo")}>
            <Plus className="size-4" />
            Nova tarefa
          </Button>
        </div>
      </div>

      <DndContext
        id="kanban-board"
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-full min-h-0 flex-1 flex-col gap-3 overflow-x-auto pb-2 sm:flex-row">
          {COLUMNS.map((col) => (
            <Column
              key={col.id}
              column={col}
              tasks={tasksByColumn[col.id]}
              onAddTask={openCreateDialog}
              onEditTask={openEditDialog}
              onDeleteTask={handleDelete}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <TaskCard
              task={activeTask}
              onEdit={() => {}}
              onDelete={() => {}}
              overlay
            />
          )}
        </DragOverlay>
      </DndContext>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        defaultStatus={dialogStatus}
        onSubmit={handleSubmit}
      />
    </>
  );
}
