"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EllipsisVertical } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { allNav } from "@/lib/nav";

interface MobileBottomNavProps {
  isCoordinator: boolean;
}

export function MobileBottomNav({ isCoordinator }: MobileBottomNavProps) {
  const pathname = usePathname();
  const visibleNav = allNav.filter((item) => !item.coordinatorOnly || isCoordinator);
  const primaryNav = visibleNav.filter((item) => item.primary);
  const moreNav = visibleNav.filter((item) => !item.primary);
  const isMoreActive = moreNav.some((item) => item.href === pathname);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-14 items-center justify-around border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 md:hidden">
      {primaryNav.map((item) => {
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

      {moreNav.length > 0 && (
        <Sheet>
          <SheetTrigger
            aria-label="Mais opções"
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-muted-foreground transition-colors",
              isMoreActive && "text-primary"
            )}
          >
            <EllipsisVertical className={cn("size-5", isMoreActive && "scale-110")} />
            <span
              className={cn(
                "size-1 rounded-full bg-transparent transition-colors",
                isMoreActive && "bg-primary"
              )}
            />
          </SheetTrigger>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>Mais opções</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 px-4 pb-4">
              {moreNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="size-4" />
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </nav>
  );
}
