"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import { Download, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  getQueueState,
  removeFromQueue,
  requestTrack,
  searchTracks,
} from "@/lib/actions/jukebox";
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

  async function handleRemove(id: string) {
    setQueue((q) => q.filter((t) => t.id !== id));
    await removeFromQueue(id).catch(() => toast.error("Erro ao remover da fila"));
  }

  async function handleRequest(result: YoutubeSearchResultWithBlock) {
    setRequestingId(result.videoId);
    try {
      const track = await requestTrack({
        videoId: result.videoId,
        title: result.title,
        channel: result.channel,
        thumbnail: result.thumbnail,
        genre: result.genre,
        requestedBy: name.trim() || undefined,
      });
      setQueue((q) => [...q, track]);
      
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.8 },
        colors: ["#ec4899", "#d946ef", "#a855f7", "#6366f1"],
      });

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
            <TooltipTrigger asChild>
              <Button type="submit" size="icon" aria-label="Buscar" disabled={isSearching}>
                <Search className="size-4" />
              </Button>
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
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-xs text-muted-foreground">
                      {result.channel}
                    </p>
                    {result.genre && (
                      <span className="shrink-0 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground capitalize">
                        {result.genre}
                      </span>
                    )}
                  </div>
                  {result.blocked && (
                    <p className="text-xs text-destructive">
                      Bloqueada pelo administrador
                    </p>
                  )}
                </div>
                  <div className="flex items-center">
                    <DropdownMenu>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" aria-label="Baixar">
                              <Download className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Baixar Música/Vídeo</TooltipContent>
                      </Tooltip>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Áudio (MP3)</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <a href={`/api/download?url=${encodeURIComponent(`https://youtube.com/watch?v=${result.videoId}`)}&type=mp3&quality=high`} target="_blank" rel="noopener noreferrer" download>
                            Alta Qualidade (Melhor Áudio)
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={`/api/download?url=${encodeURIComponent(`https://youtube.com/watch?v=${result.videoId}`)}&type=mp3&quality=low`} target="_blank" rel="noopener noreferrer" download>
                            Baixa Qualidade (Mais rápido)
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Vídeo (MP4)</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <a href={`/api/download?url=${encodeURIComponent(`https://youtube.com/watch?v=${result.videoId}`)}&type=mp4&quality=720p`} target="_blank" rel="noopener noreferrer" download>
                            HD (720p)
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={`/api/download?url=${encodeURIComponent(`https://youtube.com/watch?v=${result.videoId}`)}&type=mp4&quality=360p`} target="_blank" rel="noopener noreferrer" download>
                            SD (360p)
                          </a>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="Pedir esta música"
                        disabled={result.blocked || requestingId === result.videoId}
                        onClick={() => handleRequest(result)}
                      >
                        <Plus className="size-4" />
                      </Button>
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
          <CardContent className="flex items-center gap-2 p-3 text-sm">
            {playing ? (
              <>
                <span className="font-medium">{playing.title}</span>
                {playing.genre && (
                  <span className="shrink-0 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground capitalize">
                    {playing.genre}
                  </span>
                )}
              </>
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
              <span className="min-w-0 flex-1 truncate">{track.title}</span>
              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon-sm" variant="ghost" aria-label="Baixar">
                          <Download className="size-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Baixar Música/Vídeo</TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Áudio (MP3)</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <a href={`/api/download?url=${encodeURIComponent(`https://youtube.com/watch?v=${track.youtubeId}`)}&type=mp3&quality=high`} target="_blank" rel="noopener noreferrer" download>
                        Alta Qualidade
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href={`/api/download?url=${encodeURIComponent(`https://youtube.com/watch?v=${track.youtubeId}`)}&type=mp3&quality=low`} target="_blank" rel="noopener noreferrer" download>
                        Baixa Qualidade
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Vídeo (MP4)</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <a href={`/api/download?url=${encodeURIComponent(`https://youtube.com/watch?v=${track.youtubeId}`)}&type=mp4&quality=720p`} target="_blank" rel="noopener noreferrer" download>
                        HD (720p)
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href={`/api/download?url=${encodeURIComponent(`https://youtube.com/watch?v=${track.youtubeId}`)}&type=mp4&quality=360p`} target="_blank" rel="noopener noreferrer" download>
                        SD (360p)
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Remover da fila"
                      onClick={() => handleRemove(track.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Remover da fila</TooltipContent>
                </Tooltip>
              </div>
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
