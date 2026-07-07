import { KanbanBoard } from "@/components/kanban/kanban-board";
import { getBoardState, getTitleSuggestions } from "@/lib/actions/tasks";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [columns, titleSuggestions] = await Promise.all([
    getBoardState(),
    getTitleSuggestions(),
  ]);

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
        <KanbanBoard initialColumns={columns} titleSuggestions={titleSuggestions} />
      </div>
    </main>
  );
}
