import {
  ensurePlaybackStarted,
  getQueueState,
  getRecentlyPlayed,
} from "@/lib/actions/jukebox";
import { JukeboxPlayer } from "@/components/jukebox/jukebox-player";

export const dynamic = "force-dynamic";

export default async function JukeboxPage() {
  try {
    await ensurePlaybackStarted();
    const { playing, queued } = await getQueueState();
    const history = await getRecentlyPlayed();

    return (
      <main className="flex min-h-0 flex-1 flex-col bg-background">
        <JukeboxPlayer initialPlaying={playing} initialQueue={queued} initialHistory={history} />
      </main>
    );
  } catch (error) {
    console.error("Failed to load jukebox data:", error);
    return (
      <main className="flex min-h-0 flex-1 flex-col p-8 bg-background">
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-destructive/50 bg-destructive/10">
          <h2 className="text-xl font-bold text-destructive mb-2">Jukebox Indisponível</h2>
          <p className="text-muted-foreground">
            Não foi possível conectar ao banco de dados para carregar as músicas. Verifique a conexão com a Neon.
          </p>
        </div>
      </main>
    );
  }
}
