import { Ban, KanbanSquare, ListMusic, Radio, Settings, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  coordinatorOnly?: boolean;
}

export const boardNav: NavItem[] = [
  { title: "Quadro Kanban", href: "/", icon: KanbanSquare },
  { title: "Administração", href: "/admin", icon: Settings, coordinatorOnly: true },
  { title: "Usuários", href: "/admin/usuarios", icon: Users, coordinatorOnly: true },
];

export const jukeboxNav: NavItem[] = [
  { title: "Tocando agora", href: "/jukebox", icon: Radio },
  { title: "Pedir música", href: "/jukebox/pedir", icon: ListMusic },
  { title: "Bloqueios", href: "/jukebox/bloqueios", icon: Ban },
];

export const allNav: NavItem[] = [...boardNav, ...jukeboxNav];
