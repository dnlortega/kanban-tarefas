import { redirect } from "next/navigation";

import { KanbanBoard } from "@/components/kanban/kanban-board";
import { getBoardState, getTitleSuggestions } from "@/lib/actions/tasks";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function KanbanPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login");
  }

  let columns = [];
  let titleSuggestions: string[] = [];
  let assignableUsers: { id: string; name: string }[] = [];

  try {
    const results = await Promise.all([
      getBoardState(),
      getTitleSuggestions(),
      prisma.user.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);
    columns = results[0];
    titleSuggestions = results[1];
    assignableUsers = results[2];
  } catch (error) {
    console.error("Failed to load kanban data:", error);
    return (
      <main className="flex min-h-0 flex-1 flex-col p-8 bg-background">
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-destructive/50 bg-destructive/10">
          <h2 className="text-xl font-bold text-destructive mb-2">Banco de dados offline</h2>
          <p className="text-muted-foreground">
            Não foi possível conectar ao banco de dados para carregar o Kanban. Verifique se o servidor Neon está online.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
        <KanbanBoard
          initialColumns={columns}
          titleSuggestions={titleSuggestions}
          assignableUsers={assignableUsers}
          currentUserId={currentUser.id}
          isCoordinator={currentUser.role === "coordinator"}
        />
      </div>
    </main>
  );
}
