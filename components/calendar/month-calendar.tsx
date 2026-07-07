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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TaskAvatar } from "@/components/kanban/task-avatar";
import { cn } from "@/lib/utils";
import { updateTaskDueDate, type CalendarTask } from "@/lib/actions/tasks";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_LABELS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

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

function isToday(date: Date) {
  const now = new Date();
  return (
    date.getUTCFullYear() === now.getUTCFullYear() &&
    date.getUTCMonth() === now.getUTCMonth() &&
    date.getUTCDate() === now.getUTCDate()
  );
}

interface MonthCalendarProps {
  year: number;
  month: number;
  tasks: CalendarTask[];
  isCoordinator: boolean;
}

export function MonthCalendar({ year, month, tasks, isCoordinator }: MonthCalendarProps) {
  const [taskList, setTaskList] = useState(tasks);

  const days = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, CalendarTask[]>();
    for (const task of taskList) {
      const key = task.dueDate.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(task);
      map.set(key, list);
    }
    return map;
  }, [taskList]);

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

  const prevMonth = month === 0 ? { y: year - 1, m: 12 } : { y: year, m: month };
  const nextMonth = month === 11 ? { y: year + 1, m: 1 } : { y: year, m: month + 2 };
  const now = new Date();

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
        {days.map((day) => (
          <DayCell
            key={dayKey(day)}
            day={day}
            isCurrentMonth={day.getUTCMonth() === month}
            isToday={isToday(day)}
            tasks={tasksByDay.get(dayKey(day)) ?? []}
            draggable={isCoordinator}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4 sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">
          {MONTH_LABELS[month]} {year}
        </h2>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  size="icon-sm"
                  variant="outline"
                  aria-label="Mês anterior"
                  nativeButton={false}
                  render={<Link href={`/calendario?y=${prevMonth.y}&m=${prevMonth.m}`} />}
                />
              }
            >
              <ChevronLeft className="size-4" />
            </TooltipTrigger>
            <TooltipContent>Mês anterior</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  size="sm"
                  variant="outline"
                  aria-label="Hoje"
                  nativeButton={false}
                  render={
                    <Link href={`/calendario?y=${now.getFullYear()}&m=${now.getMonth() + 1}`} />
                  }
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
                  aria-label="Próximo mês"
                  nativeButton={false}
                  render={<Link href={`/calendario?y=${nextMonth.y}&m=${nextMonth.m}`} />}
                />
              }
            >
              <ChevronRight className="size-4" />
            </TooltipTrigger>
            <TooltipContent>Próximo mês</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {isCoordinator ? (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          {grid}
        </DndContext>
      ) : (
        grid
      )}
    </div>
  );
}

interface DayCellProps {
  day: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: CalendarTask[];
  draggable: boolean;
}

function DayCell({ day, isCurrentMonth, isToday, tasks, draggable }: DayCellProps) {
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
            <DraggableTaskChip key={task.id} task={task} />
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

function DraggableTaskChip({ task }: { task: CalendarTask }) {
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
      {...attributes}
      {...listeners}
    >
      <TaskChip task={task} />
    </div>
  );
}
