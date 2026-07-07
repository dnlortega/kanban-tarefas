"use client";

import { useMemo, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CalendarClock, Search } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TaskAvatar } from "@/components/kanban/task-avatar";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import { assignTask, type AssignableTask } from "@/lib/actions/tasks";

interface AssignUser {
  id: string;
  name: string;
  role: string;
}

interface AssignBoardProps {
  initialTasks: AssignableTask[];
  users: AssignUser[];
}

const ROLE_LABEL: Record<string, string> = {
  coordinator: "Coordenador",
  member: "Responsável",
};

export function AssignBoard({ initialTasks, users }: AssignBoardProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState("");
  const [activeTask, setActiveTask] = useState<AssignableTask | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  );

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return tasks;
    return tasks.filter((t) => t.title.toLowerCase().includes(query));
  }, [tasks, search]);

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const user = users.find((u) => u.id === over.id);
    if (!user) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.assignee?.id === user.id) return;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, assignee: { id: user.id, name: user.name } } : t
      )
    );
    startTransition(() => {
      assignTask(taskId, user.id)
        .then(() => toast.success(`"${task.title}" atribuída a ${user.name}`))
        .catch(() => toast.error("Erro ao atribuir tarefa"));
    });
  }

  return (
    <DndContext
      id="assign-board"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden p-4 sm:p-6 lg:grid-cols-[1fr_280px]">
        <div className="flex min-h-0 flex-col gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar tarefa"
              className="pl-8"
            />
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
            {filteredTasks.map((task) => (
              <DraggableTaskCard key={task.id} task={task} />
            ))}
            {filteredTasks.length === 0 && (
              <p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
                Nenhuma tarefa encontrada.
              </p>
            )}
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-2 overflow-y-auto">
          <h2 className="text-sm font-semibold text-muted-foreground">Responsáveis</h2>
          {users.map((user) => (
            <UserDropZone
              key={user.id}
              user={user}
              taskCount={tasks.filter((t) => t.assignee?.id === user.id).length}
            />
          ))}
          {users.length === 0 && (
            <p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
              Nenhum usuário cadastrado.
            </p>
          )}
        </div>
      </div>

      <DragOverlay>
        {activeTask && (
          <Card className="max-w-xs rotate-2 shadow-lg">
            <CardContent className="p-3">
              <p className="truncate text-sm font-medium">{activeTask.title}</p>
            </CardContent>
          </Card>
        )}
      </DragOverlay>
    </DndContext>
  );
}

function DraggableTaskCard({ task }: { task: AssignableTask }) {
  const { setNodeRef, attributes, listeners, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const overdue = isOverdue(task.dueDate, false);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "touch-none cursor-grab select-none active:cursor-grabbing",
        isDragging && "opacity-40"
      )}
      {...attributes}
      {...listeners}
    >
      <CardContent className="flex items-center gap-2.5 p-3">
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: task.columnColor }}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{task.title}</p>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="truncate">{task.columnTitle}</span>
            {task.dueDate && (
              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1",
                  overdue && "text-destructive"
                )}
              >
                <CalendarClock className="size-3" />
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>
        {task.assignee ? (
          <TaskAvatar name={task.assignee.name} className="shrink-0" />
        ) : (
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            Sem responsável
          </span>
        )}
      </CardContent>
    </Card>
  );
}

function UserDropZone({ user, taskCount }: { user: AssignUser; taskCount: number }) {
  const { setNodeRef, isOver } = useDroppable({ id: user.id });

  return (
    <Card
      ref={setNodeRef}
      className={cn("transition-colors", isOver && "bg-primary/10 ring-2 ring-primary/40")}
    >
      <CardContent className="flex items-center gap-2.5 p-3">
        <TaskAvatar name={user.name} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {ROLE_LABEL[user.role] ?? user.role} • {taskCount} tarefa{taskCount === 1 ? "" : "s"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
