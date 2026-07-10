"use client";

import { useEffect } from "react";
import { RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Logo } from "@/components/logo";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4 text-center">
      <Logo className="size-10" />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Algo deu errado
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Um erro inesperado aconteceu. Tente novamente.
        </p>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon" aria-label="Tentar novamente" onClick={reset}>
            <RotateCw className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Tentar novamente</TooltipContent>
      </Tooltip>
    </div>
  );
}
