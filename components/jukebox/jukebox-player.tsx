"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Music, SkipForward, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { advanceQueue, getQueueState, removeFromQueue, skipTrack } from "@/lib/actions/jukebox";
import type { Track } from "@/types/jukebox";

interface YTPlayerInstance {
  loadVideoById: (videoId: string) => void;
}

interface YTPlayerOptions {
  playerVars?: Record<string, number>;
  events?: {
    onReady?: () => void;
    onStateChange?: (event: { data: number }) => void;
  };
}

declare global {
  interface Window {
    YT?: {
      Player: new (el: HTMLElement, options: YTPlayerOptions) => YTPlayerInstance;
      PlayerState: { ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface JukeboxPlayerProps {
  initialPlaying: Track | null;
  initialQueue: Track[];
}

export function JukeboxPlayer({ initialPlaying, initialQueue }: JukeboxPlayerProps) {
  const [playing, setPlaying] = useState(initialPlaying);
  const [queue, setQueue] = useState(initialQueue);

  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const playingIdRef = useRef<string | null>(initialPlaying?.id ?? null);

  const handleEnded = useCallback(async () => {
    const next = await advanceQueue(playingIdRef.current ?? undefined);
    setPlaying(next);
    const state = await getQueueState();
    setQueue(state.queued);
  }, []);

  useEffect(() => {
    playingIdRef.current = playing?.id ?? null;
  }, [playing]);

  useEffect(() => {
    function createPlayer() {
      if (!containerRef.current || !window.YT) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        playerVars: { autoplay: 1 },
        events: {
          onReady: () => {
            if (playingIdRef.current && playerRef.current) {
              const current = playingIdRef.current;
              const track = current === initialPlaying?.id ? initialPlaying : null;
              if (track) playerRef.current.loadVideoById(track.youtubeId);
            }
          },
          onStateChange: (event) => {
            if (window.YT && event.data === window.YT.PlayerState.ENDED) {
              handleEnded();
            }
          },
        },
      });
    }

    if (window.YT?.Player) {
      createPlayer();
    } else {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(script);
      window.onYouTubeIframeAPIReady = createPlayer;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (playerRef.current && playing) {
      playerRef.current.loadVideoById(playing.youtubeId);
    }
  }, [playing]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const state = await getQueueState();
      setQueue(state.queued);
      setPlaying((current) =>
        state.playing?.id !== current?.id ? state.playing : current
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  async function handleSkip() {
    if (!playing) return;
    const next = await skipTrack(playing.id);
    setPlaying(next);
    const state = await getQueueState();
    setQueue(state.queued);
  }

  async function handleRemove(id: string) {
    setQueue((q) => q.filter((t) => t.id !== id));
    await removeFromQueue(id);
  }

  return (
    <div className="grid flex-1 grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-[1fr_320px]">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
          <div ref={containerRef} className="size-full" />
        </div>

        {playing ? (
          <Card key={playing.id} className="animate-in fade-in slide-in-from-left-2 duration-300">
            <CardContent className="flex items-center gap-3 p-4">
              {playing.thumbnail && (
                <Image
                  src={playing.thumbnail}
                  alt=""
                  width={112}
                  height={64}
                  className="h-16 w-28 shrink-0 rounded-md object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                  <p className="truncate font-medium">{playing.title}</p>
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {playing.channel}
                  {playing.requestedBy && ` • Pedido por ${playing.requestedBy}`}
                </p>
              </div>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label="Pular música"
                      onClick={handleSkip}
                    />
                  }
                >
                  <SkipForward className="size-4" />
                </TooltipTrigger>
                <TooltipContent>Pular música</TooltipContent>
              </Tooltip>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 p-10 text-center text-muted-foreground">
              <Music className="size-8" />
              <p className="text-sm">
                Nenhuma música na fila. Peça uma em &quot;Pedir música&quot;.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex min-h-0 flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Próximas ({queue.length})
        </h2>
        <div className="flex flex-col gap-2 overflow-y-auto">
          {queue.map((track, index) => (
            <Card key={track.id} className="animate-in fade-in slide-in-from-bottom-1 duration-300">
              <CardContent className="flex items-center gap-2 p-2.5">
                <span className="w-4 shrink-0 text-center text-xs text-muted-foreground">
                  {index + 1}
                </span>
                {track.thumbnail && (
                  <Image
                    src={track.thumbnail}
                    alt=""
                    width={64}
                    height={40}
                    className="h-10 w-16 shrink-0 rounded object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{track.title}</p>
                  {track.requestedBy && (
                    <p className="truncate text-xs text-muted-foreground">
                      {track.requestedBy}
                    </p>
                  )}
                </div>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label="Remover da fila"
                        onClick={() => handleRemove(track.id)}
                      />
                    }
                  >
                    <Trash2 className="size-3.5" />
                  </TooltipTrigger>
                  <TooltipContent>Remover da fila</TooltipContent>
                </Tooltip>
              </CardContent>
            </Card>
          ))}
          {queue.length === 0 && (
            <p className="rounded-lg border border-dashed py-8 text-center text-xs text-muted-foreground">
              Fila vazia
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
