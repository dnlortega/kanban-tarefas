import {
  ensurePlaybackStarted,
  getQueueState,
  getRecentlyPlayed,
} from "@/lib/actions/jukebox";
import { JukeboxPlayer } from "@/components/jukebox/jukebox-player";

export const dynamic = "force-dynamic";

export default async function JukeboxPage() {
  await ensurePlaybackStarted();
  const [{ playing, queued }, history] = await Promise.all([
    getQueueState(),
    getRecentlyPlayed(),
  ]);

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="border-b px-4 py-4 sm:px-6">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Tocando agora
        </h1>
        <p className="text-sm text-muted-foreground">
          As músicas pedidas em &quot;Pedir música&quot; tocam aqui, em ordem de chegada.
        </p>
      </div>
      <JukeboxPlayer initialPlaying={playing} initialQueue={queued} initialHistory={history} />
    </main>
  );
}
