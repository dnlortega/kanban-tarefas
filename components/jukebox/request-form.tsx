"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getQueueState, requestTrack, searchTracks } from "@/lib/actions/jukebox";
import type { Track, YoutubeSearchResultWithBlock } from "@/types/jukebox";

interface RequestFormProps {
  initialPlaying: Track | null;
  initialQueue: Track[];
}

export function RequestForm({ initialPlaying, initialQueue }: RequestFormProps) {
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<YoutubeSearchResultWithBlock[]>([]);
  const [isSearching, startSearch] = useTransition();
  const [requestingId, setRequestingId] = useState<string | null>(null);

  const [playing, setPlaying] = useState(initialPlaying);
  const [queue, setQueue] = useState(initialQueue);

  useEffect(() => {
    const interval = setInterval(async () => {
      const state = await getQueueState();
      setPlaying(state.playing);
      setQueue(state.queued);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    startSearch(async () => {
      try {
        const res = await searchTracks(query.trim());
        setResults(res);
        if (res.length === 0) toast.error("Nenhum resultado encontrado.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao buscar.");
      }
    });
  }

  async function handleRequest(result: YoutubeSearchResultWithBlock) {
    setRequestingId(result.videoId);
    try {
      const track = await requestTrack({
        videoId: result.videoId,
        title: result.title,
        channel: result.channel,
        thumbnail: result.thumbnail,
        requestedBy: name.trim() || undefined,
      });
      setQueue((q) => [...q, track]);
      toast.success("Música adicionada à fila!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao pedir música.");
    } finally {
      setRequestingId(null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome (opcional)"
        />
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar música ou artista"
            className="flex-1"
          />
          <Tooltip>
            <TooltipTrigger
              render={
                <Button type="submit" size="icon" aria-label="Buscar" disabled={isSearching} />
              }
            >
              <Search className="size-4" />
            </TooltipTrigger>
            <TooltipContent>Buscar</TooltipContent>
          </Tooltip>
        </form>

        <div className="flex flex-col gap-2">
          {results.map((result) => (
            <Card
              key={result.videoId}
              className={cn(
                "animate-in fade-in slide-in-from-bottom-1 duration-300",
                result.blocked && "opacity-50"
              )}
            >
              <CardContent className="flex items-center gap-3 p-3">
                {result.thumbnail && (
                  <Image
                    src={result.thumbnail}
                    alt=""
                    width={80}
                    height={48}
                    className="h-12 w-20 shrink-0 rounded object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{result.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {result.channel}
                  </p>
                  {result.blocked && (
                    <p className="text-xs text-destructive">
                      Bloqueada pelo administrador
                    </p>
                  )}
                </div>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="Pedir esta música"
                        disabled={result.blocked || requestingId === result.videoId}
                        onClick={() => handleRequest(result)}
                      />
                    }
                  >
                    <Plus className="size-4" />
                  </TooltipTrigger>
                  <TooltipContent>Pedir esta música</TooltipContent>
                </Tooltip>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Tocando agora
        </h2>
        <Card>
          <CardContent className="p-3 text-sm">
            {playing ? (
              <span className="font-medium">{playing.title}</span>
            ) : (
              <span className="text-muted-foreground">Nada tocando ainda</span>
            )}
          </CardContent>
        </Card>

        <h2 className="mt-2 text-sm font-semibold text-muted-foreground">
          Próximas na fila ({queue.length})
        </h2>
        <div className="flex flex-col gap-1.5">
          {queue.map((track, index) => (
            <div
              key={track.id}
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
            >
              <span className="text-xs text-muted-foreground">{index + 1}</span>
              <span className="truncate">{track.title}</span>
            </div>
          ))}
          {queue.length === 0 && (
            <p className="rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground">
              Fila vazia — peça a primeira música!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
