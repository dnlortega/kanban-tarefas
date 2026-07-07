import {
  Ban,
  Calendar,
  Info,
  KanbanSquare,
  ListMusic,
  Radio,
  Send,
  Settings,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  coordinatorOnly?: boolean;
  /** Shown directly in the mobile bottom nav; everything else goes in "Mais". */
  primary?: boolean;
}

export const boardNav: NavItem[] = [
  { title: "Quadro Kanban", href: "/", icon: KanbanSquare, primary: true },
  { title: "Calendário", href: "/calendario", icon: Calendar, primary: true },
  { title: "Atribuir tarefas", href: "/atribuir", icon: Send, coordinatorOnly: true },
  { title: "Administração", href: "/admin", icon: Settings, coordinatorOnly: true },
  { title: "Usuários", href: "/admin/usuarios", icon: Users, coordinatorOnly: true },
  { title: "Sobre", href: "/sobre", icon: Info },
];

export const jukeboxNav: NavItem[] = [
  { title: "Tocando agora", href: "/jukebox", icon: Radio, primary: true },
  { title: "Pedir música", href: "/jukebox/pedir", icon: ListMusic, primary: true },
  { title: "Bloqueios", href: "/jukebox/bloqueios", icon: Ban },
];

export const allNav: NavItem[] = [...boardNav, ...jukeboxNav];
