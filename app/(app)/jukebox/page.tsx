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
      <JukeboxPlayer initialPlaying={playing} initialQueue={queued} initialHistory={history} />
    </main>
  );
}
