import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { ColumnManager } from "@/components/admin/column-manager";
import type { Column } from "@/types/task";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "coordinator") {
    redirect("/");
  }

  const columns = await prisma.column.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { tasks: true } } },
  });

  const serialized: (Column & { taskCount: number })[] = columns.map((c) => ({
    id: c.id,
    title: c.title,
    color: c.color,
    isDone: c.isDone,
    order: c.order,
    taskCount: c._count.tasks,
  }));

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background p-4 sm:p-6">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Administração de colunas
          </h1>
          <p className="text-sm text-muted-foreground">
            Crie, edite, reordene ou remova os status (colunas) do quadro Kanban.
          </p>
        </div>

        <ColumnManager initialColumns={serialized} />
      </div>
    </main>
  );
}
