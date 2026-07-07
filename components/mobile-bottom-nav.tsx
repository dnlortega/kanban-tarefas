"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { allNav } from "@/lib/nav";

interface MobileBottomNavProps {
  isCoordinator: boolean;
}

export function MobileBottomNav({ isCoordinator }: MobileBottomNavProps) {
  const pathname = usePathname();
  const visibleNav = allNav.filter((item) => !item.coordinatorOnly || isCoordinator);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-14 items-center justify-around border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 md:hidden">
      {visibleNav.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.title}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-muted-foreground transition-colors",
              isActive && "text-primary"
            )}
          >
            <item.icon className={cn("size-5", isActive && "scale-110")} />
            <span
              className={cn(
                "size-1 rounded-full bg-transparent transition-colors",
                isActive && "bg-primary"
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}
