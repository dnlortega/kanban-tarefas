import { listBlockedSongs } from "@/lib/actions/blocklist";
import { BlockedSongsManager } from "@/components/jukebox/blocked-songs-manager";

export const dynamic = "force-dynamic";

export default async function BlockedSongsPage() {
  const blocked = await listBlockedSongs();

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background p-4 sm:p-6">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Músicas bloqueadas
          </h1>
          <p className="text-sm text-muted-foreground">
            Termos bloqueados não podem ser pedidos nem tocados no jukebox.
          </p>
        </div>

        <BlockedSongsManager
          initialBlocked={blocked.map((b) => ({
            id: b.id,
            term: b.term,
            createdAt: b.createdAt.toISOString(),
          }))}
        />
      </div>
    </main>
  );
}
