import { prisma } from "@/lib/prisma";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { getTitleSuggestions } from "@/lib/actions/tasks";
import type { ColumnWithTasks } from "@/types/task";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [columns, titleSuggestions] = await Promise.all([
    prisma.column.findMany({
      orderBy: { order: "asc" },
      include: { tasks: { orderBy: { order: "asc" } } },
    }),
    getTitleSuggestions(),
  ]);

  const serializedColumns: ColumnWithTasks[] = columns.map((col) => ({
    id: col.id,
    title: col.title,
    color: col.color,
    isDone: col.isDone,
    order: col.order,
    tasks: col.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      assignee: task.assignee,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      order: task.order,
      columnId: task.columnId,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    })),
  }));

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
        <KanbanBoard
          initialColumns={serializedColumns}
          titleSuggestions={titleSuggestions}
        />
      </div>
    </main>
  );
}
