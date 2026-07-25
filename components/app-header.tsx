"use client";

import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { allNav } from "@/lib/nav";
import { logout } from "@/lib/actions/auth";
import { PwaInstallButton } from "@/components/pwa-install-button";

interface AppHeaderProps {
  userName: string;
}

export function AppHeader({ userName }: AppHeaderProps) {
  const pathname = usePathname();
  const current = allNav.find((item) => item.href === pathname);

  return (
    <header className="mx-4 mt-4 mb-2 flex h-14 shrink-0 items-center gap-2 rounded-2xl border border-border/50 bg-background/50 px-4 backdrop-blur-xl shadow-sm transition-all hover:bg-background/60">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-5" />
      <div className="flex items-center gap-1.5">
        {current && <current.icon className="size-4 text-muted-foreground" />}
        <span className="text-sm font-medium">
          {current?.title ?? "Central de Tarefas & Jukebox"}
        </span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <span className="hidden text-sm text-muted-foreground sm:inline">{userName}</span>
        <PwaInstallButton />
        <form action={logout}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="submit" variant="ghost" size="icon" aria-label="Sair">
                <LogOut className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Sair</TooltipContent>
          </Tooltip>
        </form>
      </div>
    </header>
  );
}
