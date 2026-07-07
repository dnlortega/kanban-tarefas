import { getQueueState } from "@/lib/actions/jukebox";
import { RequestForm } from "@/components/jukebox/request-form";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export const dynamic = "force-dynamic";

export default async function RequestPage() {
  const { playing, queued } = await getQueueState();

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <Logo className="size-7" />
          <span className="text-sm font-semibold tracking-tight">Pedir música</span>
        </div>
        <ThemeToggle />
      </header>
      <RequestForm initialPlaying={playing} initialQueue={queued} />
    </div>
  );
}
