import { getCurrentUser } from "@/lib/session";
import { getTasksForMonth, getTitleSuggestions } from "@/lib/actions/tasks";
import { prisma } from "@/lib/prisma";
import { MonthCalendar } from "@/components/calendar/month-calendar";

export const dynamic = "force-dynamic";

interface CalendarPageProps {
  searchParams: Promise<{ y?: string; m?: string }>;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = await searchParams;
  const now = new Date();
  const year = params.y ? Number(params.y) : now.getFullYear();
  const month = params.m ? Number(params.m) - 1 : now.getMonth();

  const [currentUser, tasks, columns, users, titleSuggestions] = await Promise.all([
    getCurrentUser(),
    getTasksForMonth(year, month),
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
      <MonthCalendar
        year={year}
        month={month}
        tasks={tasks}
        isCoordinator={isCoordinator}
        columns={columns}
        assignableUsers={users}
        titleSuggestions={titleSuggestions}
      />
    </main>
  );
}
