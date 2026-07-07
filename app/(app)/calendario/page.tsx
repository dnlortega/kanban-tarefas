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
      <div className="border-b px-4 py-4 sm:px-6">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Calendário</h1>
        <p className="text-sm text-muted-foreground">
          Tarefas com prazo em cada dia do mês.
          {currentUser?.role === "coordinator" &&
            " Arraste uma tarefa para outro dia para mudar o prazo."}
        </p>
      </div>
      <MonthCalendar
        year={year}
        month={month}
        tasks={tasks}
        isCoordinator={currentUser?.role === "coordinator"}
      />
    </main>
  );
}
