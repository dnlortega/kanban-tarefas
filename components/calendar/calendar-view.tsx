"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  Calendar as CalendarIcon,
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { TaskAvatar } from "@/components/kanban/task-avatar";
import { TaskDialog } from "@/components/kanban/task-dialog";
import { cn } from "@/lib/utils";
import { updateTask, updateTaskDueDate, type CalendarTask } from "@/lib/actions/tasks";
import type { Column as ColumnType, TaskAssignee, TaskInput } from "@/types/task";

export type CalendarViewMode = "day" | "month" | "year";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_LABELS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const ALL_ASSIGNEES = "__all__";

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildMonthGrid(year: number, month: number): Date[] {
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const firstWeekday = firstOfMonth.getUTCDay();
  const gridStart = new Date(Date.UTC(year, month, 1 - firstWeekday));

  const lastOfMonth = new Date(Date.UTC(year, month + 1, 0));
  const lastWeekday = lastOfMonth.getUTCDay();
  const gridEnd = new Date(Date.UTC(year, month + 1, 0 + (6 - lastWeekday)));

  const days: Date[] = [];
  const cursor = new Date(gridStart);
  while (cursor.getTime() <= gridEnd.getTime()) {
    days.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

function isSameUtcDay(date: Date, other: Date) {
  return (
    date.getUTCFullYear() === other.getUTCFullYear() &&
    date.getUTCMonth() === other.getUTCMonth() &&
    date.getUTCDate() === other.getUTCDate()
  );
}

function isToday(date: Date) {
  return isSameUtcDay(date, new Date());
}

interface CalendarViewProps {
  view: CalendarViewMode;
  year: number;
  month: number;
  day: number;
  tasks: CalendarTask[];
  isCoordinator: boolean;
  columns: ColumnType[];
  assignableUsers: TaskAssignee[];
  titleSuggestions: string[];
}

export function CalendarView({
  view,
  year,
  month,
  day,
  tasks,
  isCoordinator,
  columns,
  assignableUsers,
  titleSuggestions,
}: CalendarViewProps) {
  const [taskList, setTaskList] = useState(tasks);
  const [assigneeFilter, setAssigneeFilter] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<CalendarTask | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const assigneeOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const task of taskList) {
      if (task.assignee) map.set(task.assignee.id, task.assignee.name);
    }
    return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [taskList]);

  const filteredTasks = useMemo(() => {
    if (!assigneeFilter) return taskList;
    return taskList.filter((t) => t.assignee?.id === assigneeFilter);
  }, [taskList, assigneeFilter]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, CalendarTask[]>();
    for (const task of filteredTasks) {
      const key = task.dueDate.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(task);
      map.set(key, list);
    }
    return map;
  }, [filteredTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const targetDay = over.id as string;
    const task = taskList.find((t) => t.id === taskId);
    if (!task || task.dueDate.slice(0, 10) === targetDay) return;

    const newDueDate = `${targetDay}T12:00:00.000Z`;
    setTaskList((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, dueDate: newDueDate } : t))
    );
    updateTaskDueDate(taskId, newDueDate)
      .then(() => toast.success(`"${task.title}" reagendada`))
      .catch(() => toast.error("Erro ao mudar o prazo"));
  }

  function handleOpenTask(task: CalendarTask) {
    setEditingTask(task);
    setDialogOpen(true);
  }

  function handleSubmitEdit(input: TaskInput) {
    if (!editingTask) return;
    const id = editingTask.id;
    const assignee = input.assigneeId
      ? (assignableUsers.find((u) => u.id === input.assigneeId) ?? null)
      : null;

    setTaskList((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              title: input.title,
              description: input.description ?? null,
              assignee,
              dueDate: input.dueDate ?? t.dueDate,
            }
          : t
      )
    );
    updateTask(id, input)
      .then(() => toast.success("Tarefa atualizada"))
      .catch(() => toast.error("Erro ao atualizar tarefa"));
  }

  const now = new Date();
  const current = new Date(Date.UTC(year, month, view === "day" ? day : 1));

  let heading: string;
  let prevHref: string;
  let nextHref: string;
  let todayHref: string;

  if (view === "day") {
    heading = `${current.getUTCDate()} de ${MONTH_LABELS[month]} de ${year}`;
    const prev = new Date(current);
    prev.setUTCDate(prev.getUTCDate() - 1);
    const next = new Date(current);
    next.setUTCDate(next.getUTCDate() + 1);
    prevHref = `/calendario?view=day&y=${prev.getUTCFullYear()}&m=${prev.getUTCMonth() + 1}&d=${prev.getUTCDate()}`;
    nextHref = `/calendario?view=day&y=${next.getUTCFullYear()}&m=${next.getUTCMonth() + 1}&d=${next.getUTCDate()}`;
    todayHref = `/calendario?view=day&y=${now.getFullYear()}&m=${now.getMonth() + 1}&d=${now.getDate()}`;
  } else if (view === "year") {
    heading = `${year}`;
    prevHref = `/calendario?view=year&y=${year - 1}`;
    nextHref = `/calendario?view=year&y=${year + 1}`;
    todayHref = `/calendario?view=year&y=${now.getFullYear()}`;
  } else {
    heading = `${MONTH_LABELS[month]} ${year}`;
    const prev = month === 0 ? { y: year - 1, m: 12 } : { y: year, m: month };
    const next = month === 11 ? { y: year + 1, m: 1 } : { y: year, m: month + 2 };
    prevHref = `/calendario?view=month&y=${prev.y}&m=${prev.m}`;
    nextHref = `/calendario?view=month&y=${next.y}&m=${next.m}`;
    todayHref = `/calendario?view=month&y=${now.getFullYear()}&m=${now.getMonth() + 1}`;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{heading}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            items={[
              { value: ALL_ASSIGNEES, label: "Todos os responsáveis" },
              ...assigneeOptions.map((u) => ({ value: u.id, label: u.name })),
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
              {assigneeOptions.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 rounded-lg border p-0.5">
            <ViewLink view="day" current={view} year={year} month={month} day={day} />
            <ViewLink view="month" current={view} year={year} month={month} day={day} />
            <ViewLink view="year" current={view} year={year} month={month} day={day} />
          </div>

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    size="icon-sm"
                    variant="outline"
                    aria-label="Anterior"
                    nativeButton={false}
                    render={<Link href={prevHref} />}
                  />
                }
              >
                <ChevronLeft className="size-4" />
              </TooltipTrigger>
              <TooltipContent>Anterior</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    size="sm"
                    variant="outline"
                    aria-label="Hoje"
                    nativeButton={false}
                    render={<Link href={todayHref} />}
                  />
                }
              >
                Hoje
              </TooltipTrigger>
              <TooltipContent>Ir para hoje</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    size="icon-sm"
                    variant="outline"
                    aria-label="Próximo"
                    nativeButton={false}
                    render={<Link href={nextHref} />}
                  />
                }
              >
                <ChevronRight className="size-4" />
              </TooltipTrigger>
              <TooltipContent>Próximo</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {view === "month" && (
        <MonthGrid
          year={year}
          month={month}
          tasksByDay={tasksByDay}
          isCoordinator={isCoordinator}
          onOpenTask={handleOpenTask}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        />
      )}

      {view === "day" && (
        <DayList
          tasks={tasksByDay.get(dayKey(current)) ?? []}
          isCoordinator={isCoordinator}
          onOpenTask={handleOpenTask}
        />
      )}

      {view === "year" && <YearGrid year={year} tasksByDay={tasksByDay} />}

      {isCoordinator && (
        <TaskDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          task={editingTask}
          defaultColumnId={editingTask?.columnId ?? columns[0]?.id ?? ""}
          columns={columns}
          assignableUsers={assignableUsers}
          titleSuggestions={titleSuggestions}
          onSubmit={handleSubmitEdit}
        />
      )}
    </div>
  );
}

const VIEW_ICON: Record<CalendarViewMode, typeof CalendarDays> = {
  day: CalendarDays,
  month: CalendarIcon,
  year: CalendarRange,
};
const VIEW_LABEL: Record<CalendarViewMode, string> = {
  day: "Dia",
  month: "Mês",
  year: "Ano",
};

function ViewLink({
  view,
  current,
  year,
  month,
  day,
}: {
  view: CalendarViewMode;
  current: CalendarViewMode;
  year: number;
  month: number;
  day: number;
}) {
  const Icon = VIEW_ICON[view];
  const href =
    view === "day"
      ? `/calendario?view=day&y=${year}&m=${month + 1}&d=${day}`
      : view === "year"
        ? `/calendario?view=year&y=${year}`
        : `/calendario?view=month&y=${year}&m=${month + 1}`;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            size="icon-sm"
            variant={current === view ? "secondary" : "ghost"}
            aria-label={`Visualizar por ${VIEW_LABEL[view]}`}
            nativeButton={false}
            render={<Link href={href} />}
          />
        }
      >
        <Icon className="size-4" />
      </TooltipTrigger>
      <TooltipContent>{VIEW_LABEL[view]}</TooltipContent>
    </Tooltip>
  );
}

interface MonthGridProps {
  year: number;
  month: number;
  tasksByDay: Map<string, CalendarTask[]>;
  isCoordinator: boolean;
  onOpenTask: (task: CalendarTask) => void;
  onDragEnd: (event: DragEndEvent) => void;
  sensors: ReturnType<typeof useSensors>;
}

function MonthGrid({
  year,
  month,
  tasksByDay,
  isCoordinator,
  onOpenTask,
  onDragEnd,
  sensors,
}: MonthGridProps) {
  const days = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const grid = (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="grid grid-cols-7 border-b text-center text-xs font-medium text-muted-foreground">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-2">
            {label}
          </div>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-7 grid-rows-6 overflow-y-auto">
        {days.map((d) => (
          <DayCell
            key={dayKey(d)}
            day={d}
            isCurrentMonth={d.getUTCMonth() === month}
            isToday={isToday(d)}
            tasks={tasksByDay.get(dayKey(d)) ?? []}
            draggable={isCoordinator}
            onOpenTask={isCoordinator ? onOpenTask : undefined}
          />
        ))}
      </div>
    </div>
  );

  return isCoordinator ? (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      {grid}
    </DndContext>
  ) : (
    grid
  );
}

interface DayCellProps {
  day: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: CalendarTask[];
  draggable: boolean;
  onOpenTask?: (task: CalendarTask) => void;
}

function DayCell({ day, isCurrentMonth, isToday, tasks, draggable, onOpenTask }: DayCellProps) {
  const { setNodeRef, isOver } = useDroppable({ id: dayKey(day), disabled: !draggable });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-24 flex-col gap-1 border-b border-r p-1.5",
        !isCurrentMonth && "bg-muted/30",
        isOver && "bg-primary/10 ring-2 ring-primary/40 ring-inset"
      )}
    >
      <span
        className={cn(
          "self-start rounded-full px-1.5 py-0.5 text-xs font-medium",
          isToday
            ? "bg-primary text-primary-foreground"
            : isCurrentMonth
              ? "text-foreground"
              : "text-muted-foreground/60"
        )}
      >
        {day.getUTCDate()}
      </span>
      <div className="flex flex-col gap-1 overflow-y-auto">
        {tasks.map((task) =>
          draggable ? (
            <DraggableTaskChip key={task.id} task={task} onOpen={onOpenTask} />
          ) : (
            <TaskChip key={task.id} task={task} />
          )
        )}
      </div>
    </div>
  );
}

function TaskChip({ task }: { task: CalendarTask }) {
  return (
    <div
      className="flex items-center gap-1 truncate rounded px-1.5 py-0.5 text-[11px] font-medium"
      style={{
        backgroundColor: `${task.columnColor}1a`,
        color: task.columnColor,
        textDecoration: task.isDoneColumn ? "line-through" : "none",
      }}
      title={task.title}
    >
      {task.assignee && <TaskAvatar name={task.assignee.name} />}
      <span className="truncate">{task.title}</span>
    </div>
  );
}

function DraggableTaskChip({
  task,
  onOpen,
}: {
  task: CalendarTask;
  onOpen?: (task: CalendarTask) => void;
}) {
  const { setNodeRef, attributes, listeners, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("touch-none cursor-grab select-none active:cursor-grabbing", isDragging && "opacity-40 z-10")}
      onClick={() => onOpen?.(task)}
      {...attributes}
      {...listeners}
    >
      <TaskChip task={task} />
    </div>
  );
}

interface DayListProps {
  tasks: CalendarTask[];
  isCoordinator: boolean;
  onOpenTask: (task: CalendarTask) => void;
}

function DayList({ tasks, isCoordinator, onOpenTask }: DayListProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
      {tasks.length === 0 && (
        <p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
          Nenhuma tarefa com prazo neste dia.
        </p>
      )}
      {tasks.map((task) => (
        <Card
          key={task.id}
          className={cn(isCoordinator && "cursor-pointer hover:bg-muted/50")}
          onClick={isCoordinator ? () => onOpenTask(task) : undefined}
        >
          <CardContent className="flex items-center gap-3 p-3">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: task.columnColor }}
            />
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "truncate text-sm font-medium",
                  task.isDoneColumn && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </p>
              {task.description && (
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {task.description}
                </p>
              )}
              <p className="mt-0.5 text-xs text-muted-foreground">{task.columnTitle}</p>
            </div>
            {task.assignee && (
              <div className="flex shrink-0 items-center gap-1.5">
                <TaskAvatar name={task.assignee.name} />
                <span className="text-xs text-muted-foreground">{task.assignee.name}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function YearGrid({
  year,
  tasksByDay,
}: {
  year: number;
  tasksByDay: Map<string, CalendarTask[]>;
}) {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">
      {MONTH_LABELS.map((label, month) => (
        <MiniMonth key={label} year={year} month={month} label={label} tasksByDay={tasksByDay} />
      ))}
    </div>
  );
}

function MiniMonth({
  year,
  month,
  label,
  tasksByDay,
}: {
  year: number;
  month: number;
  label: string;
  tasksByDay: Map<string, CalendarTask[]>;
}) {
  const days = useMemo(() => buildMonthGrid(year, month), [year, month]);

  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-3">
        <Link
          href={`/calendario?view=month&y=${year}&m=${month + 1}`}
          className="text-sm font-medium hover:underline"
        >
          {label}
        </Link>
        <div className="grid grid-cols-7 gap-0.5 text-center text-[9px] text-muted-foreground">
          {WEEKDAY_LABELS.map((w) => (
            <span key={w}>{w[0]}</span>
          ))}
          {days.map((d) => {
            const inMonth = d.getUTCMonth() === month;
            const count = tasksByDay.get(dayKey(d))?.length ?? 0;
            return (
              <Link
                key={dayKey(d)}
                href={`/calendario?view=day&y=${d.getUTCFullYear()}&m=${d.getUTCMonth() + 1}&d=${d.getUTCDate()}`}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-full text-[10px]",
                  !inMonth && "text-muted-foreground/40",
                  isToday(d) && "bg-primary text-primary-foreground",
                  count > 0 && inMonth && !isToday(d) && "bg-primary/15 font-medium text-primary"
                )}
              >
                {d.getUTCDate()}
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
