"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import { boardNav, jukeboxNav } from "@/lib/nav";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  coordinatorOnly?: boolean;
}

interface NavGroupProps {
  label: string;
  items: NavItem[];
  pathname: string;
}

function NavGroup({ label, items, pathname }: NavGroupProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                render={<Link href={item.href} />}
                isActive={pathname === item.href}
                tooltip={item.title}
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

interface AppSidebarProps {
  isCoordinator: boolean;
}

export function AppSidebar({ isCoordinator }: AppSidebarProps) {
  const pathname = usePathname();
  const visibleBoardNav = boardNav.filter((item) => !item.coordinatorOnly || isCoordinator);

  return (
    <Sidebar collapsible="icon" className="hidden md:flex">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-2 px-1">
          <Logo className="size-7 shrink-0" />
          <span className="text-sm font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            Central
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavGroup label="Tarefas" items={visibleBoardNav} pathname={pathname} />
        <NavGroup label="Jukebox" items={jukeboxNav} pathname={pathname} />
      </SidebarContent>
    </Sidebar>
  );
}
