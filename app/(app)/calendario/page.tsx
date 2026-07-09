import { getCurrentUser } from "@/lib/session";
import {
  getTasksForMonth,
  getTasksForYear,
  getTitleSuggestions,
} from "@/lib/actions/tasks";
import { prisma } from "@/lib/prisma";
import { CalendarView, type CalendarViewMode } from "@/components/calendar/calendar-view";

export const dynamic = "force-dynamic";

interface CalendarPageProps {
  searchParams: Promise<{ y?: string; m?: string; d?: string; view?: string }>;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = await searchParams;
  const now = new Date();
  const view: CalendarViewMode =
    params.view === "day" || params.view === "year" ? params.view : "month";
  const year = params.y ? Number(params.y) : now.getFullYear();
  const month = params.m ? Number(params.m) - 1 : now.getMonth();
  const day = params.d ? Number(params.d) : now.getDate();

  const [currentUser, tasks, columns, users, titleSuggestions] = await Promise.all([
    getCurrentUser(),
    view === "year" ? getTasksForYear(year) : getTasksForMonth(year, month),
    prisma.column.findMany({
      orderBy: { order: "asc" },
      select: { id: true, title: true, color: true, isDone: true, order: true },
    }),
    prisma.user.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    getTitleSuggestions(),
  ]);

  const isCoordinator = currentUser?.role === "coordinator";

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background">
      <CalendarView
        view={view}
        year={year}
        month={month}
        day={day}
        tasks={tasks}
        isCoordinator={isCoordinator}
        columns={columns}
        assignableUsers={users}
        titleSuggestions={titleSuggestions}
      />
    </main>
  );
}
