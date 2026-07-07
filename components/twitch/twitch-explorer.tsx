"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { Radio, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getClips, searchChannels } from "@/lib/actions/twitch";
import type { TwitchClip, TwitchStream } from "@/lib/twitch";

interface ChannelResult {
  channel: {
    id: string;
    login: string;
    displayName: string;
    thumbnail: string;
    isLive: boolean;
  };
  stream: TwitchStream | null;
}

export function TwitchExplorer() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ChannelResult[]>([]);
  const [isSearching, startSearch] = useTransition();
  const [selected, setSelected] = useState<ChannelResult | null>(null);
  const [clips, setClips] = useState<TwitchClip[]>([]);
  const [hostname, setHostname] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- window is only available client-side
    setHostname(window.location.hostname);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    startSearch(async () => {
      try {
        const res = await searchChannels(query.trim());
        setResults(res);
        if (res.length === 0) toast.error("Nenhum canal encontrado.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao buscar.");
      }
    });
  }

  function handleSelect(result: ChannelResult) {
    setSelected(result);
    setClips([]);
    getClips(result.channel.id)
      .then(setClips)
      .catch(() => {});
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar canal da Twitch"
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
            key={result.channel.id}
            className={cn(
              "cursor-pointer transition-colors hover:bg-muted/50",
              selected?.channel.id === result.channel.id && "ring-2 ring-primary/40"
            )}
            onClick={() => handleSelect(result)}
          >
            <CardContent className="flex items-center gap-3 p-3">
              {result.channel.thumbnail && (
                <Image
                  src={result.channel.thumbnail}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 shrink-0 rounded-full object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{result.channel.displayName}</p>
                {result.stream ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {result.stream.gameName} • {result.stream.viewerCount} espectadores
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">Offline</p>
                )}
              </div>
              {result.channel.isLive && (
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                  <Radio className="size-3" />
                  AO VIVO
                </span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selected && hostname && (
        <div className="flex flex-col gap-3">
          {selected.channel.isLive ? (
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
              <iframe
                src={`https://player.twitch.tv/?channel=${selected.channel.login}&parent=${hostname}&muted=false`}
                allowFullScreen
                className="size-full"
              />
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                {selected.channel.displayName} não está ao vivo agora.
              </CardContent>
            </Card>
          )}

          {clips.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-muted-foreground">Clipes em destaque</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {clips.map((clip) => (
                  <a
                    key={clip.id}
                    href={clip.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex flex-col gap-1"
                  >
                    <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                      {clip.thumbnail && (
                        <Image
                          src={clip.thumbnail}
                          alt=""
                          width={160}
                          height={90}
                          className="size-full object-cover transition-transform group-hover:scale-105"
                        />
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{clip.title}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
