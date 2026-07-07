import { getQueueState } from "@/lib/actions/jukebox";
import { RequestForm } from "@/components/jukebox/request-form";

export const dynamic = "force-dynamic";

export default async function RequestPage() {
  const { playing, queued } = await getQueueState();

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="border-b px-4 py-4 sm:px-6">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Pedir música
        </h1>
        <p className="text-sm text-muted-foreground">
          Busque uma música pelo nome e adicione à fila do jukebox.
        </p>
      </div>
      <RequestForm initialPlaying={playing} initialQueue={queued} />
    </main>
  );
}
