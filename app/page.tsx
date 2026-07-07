import { KanbanBoard } from "@/components/kanban/kanban-board";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-1 flex-col bg-background p-4 sm:p-6">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
        <KanbanBoard />
      </div>
    </main>
  );
}
