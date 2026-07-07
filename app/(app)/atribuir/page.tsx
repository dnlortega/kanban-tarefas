import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { getAssignableTasks } from "@/lib/actions/tasks";
import { prisma } from "@/lib/prisma";
import { AssignBoard } from "@/components/assign/assign-board";

export const dynamic = "force-dynamic";

export default async function AssignPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "coordinator") {
    redirect("/");
  }

  const [tasks, users] = await Promise.all([
    getAssignableTasks(),
    prisma.user.findMany({
      select: { id: true, name: true, role: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="border-b px-4 py-4 sm:px-6">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Atribuir tarefas
        </h1>
        <p className="text-sm text-muted-foreground">
          Arraste uma tarefa e solte sobre o responsável para atribuí-la.
        </p>
      </div>
      <AssignBoard initialTasks={tasks} users={users} />
    </main>
  );
}
