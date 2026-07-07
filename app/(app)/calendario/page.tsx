import { getCurrentUser } from "@/lib/session";
import { getTasksForMonth } from "@/lib/actions/tasks";
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

  const [currentUser, tasks] = await Promise.all([
    getCurrentUser(),
    getTasksForMonth(year, month),
  ]);

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background">
      <MonthCalendar
        year={year}
        month={month}
        tasks={tasks}
        isCoordinator={currentUser?.role === "coordinator"}
      />
    </main>
  );
}
