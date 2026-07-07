import Link from "next/link";
import { Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4 text-center">
      <Logo className="size-10" />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Página não encontrada
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          O endereço que você acessou não existe.
        </p>
      </div>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              size="icon"
              aria-label="Voltar ao início"
              nativeButton={false}
              render={<Link href="/" />}
            />
          }
        >
          <Home className="size-4" />
        </TooltipTrigger>
        <TooltipContent>Voltar ao início</TooltipContent>
      </Tooltip>
    </div>
  );
}
