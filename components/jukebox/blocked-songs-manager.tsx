"use client";

import { useState, useTransition } from "react";
import { Ban, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { addBlockedSong, removeBlockedSong } from "@/lib/actions/blocklist";

interface BlockedSong {
  id: string;
  term: string;
  createdAt: string;
}

interface BlockedSongsManagerProps {
  initialBlocked: BlockedSong[];
}

export function BlockedSongsManager({ initialBlocked }: BlockedSongsManagerProps) {
  const [blocked, setBlocked] = useState(initialBlocked);
  const [term, setTerm] = useState("");
  const [, startTransition] = useTransition();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = term.trim();
    if (!trimmed) return;

    startTransition(async () => {
      try {
        const created = await addBlockedSong(trimmed);
        setBlocked((prev) => [
          {
            id: created.id,
            term: created.term,
            createdAt: new Date(created.createdAt).toISOString(),
          },
          ...prev,
        ]);
        setTerm("");
        toast.success("Termo bloqueado adicionado");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao bloquear termo");
      }
    });
  }

  function handleRemove(id: string) {
    setBlocked((prev) => prev.filter((b) => b.id !== id));
    startTransition(() => {
      removeBlockedSong(id).catch(() => toast.error("Erro ao remover bloqueio"));
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Ex: nome da música ou artista proibido"
          className="flex-1"
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="submit" size="icon" aria-label="Bloquear termo">
              <Plus className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Bloquear termo</TooltipContent>
        </Tooltip>
      </form>

      <div className="flex flex-col gap-2">
        {blocked.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex items-center gap-3 p-3">
              <Ban className="size-4 shrink-0 text-destructive" />
              <span className="flex-1 truncate text-sm font-medium">{item.term}</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Remover bloqueio"
                    onClick={() => handleRemove(item.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Remover bloqueio</TooltipContent>
              </Tooltip>
            </CardContent>
          </Card>
        ))}
        {blocked.length === 0 && (
          <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
            Nenhum termo bloqueado ainda.
          </p>
        )}
      </div>
    </div>
  );
}
