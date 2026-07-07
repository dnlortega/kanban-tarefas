import { redirect } from "next/navigation";

import { KanbanBoard } from "@/components/kanban/kanban-board";
import { getBoardState, getTitleSuggestions } from "@/lib/actions/tasks";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login");
  }

  const [columns, titleSuggestions, assignableUsers] = await Promise.all([
    getBoardState(),
    getTitleSuggestions(),
    prisma.user.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

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
