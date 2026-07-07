"use client";

import { usePathname } from "next/navigation";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/logo";
import { allNav } from "@/lib/nav";

export function AppHeader() {
  const pathname = usePathname();
  const current = allNav.find((item) => item.href === pathname);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
      <SidebarTrigger className="hidden md:inline-flex" />
      <Separator orientation="vertical" className="hidden h-5 md:block" />
      <Logo className="size-6 md:hidden" />
      <div className="flex items-center gap-1.5">
        {current && <current.icon className="size-4 text-muted-foreground" />}
        <span className="text-sm font-medium">
          {current?.title ?? "Central de Tarefas & Jukebox"}
        </span>
      </div>
    </header>
  );
}
