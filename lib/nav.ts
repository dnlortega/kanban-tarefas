import { Ban, KanbanSquare, ListMusic, Radio, Settings } from "lucide-react";

export const boardNav = [
  { title: "Quadro Kanban", href: "/", icon: KanbanSquare },
  { title: "Administração", href: "/admin", icon: Settings },
];

export const jukeboxNav = [
  { title: "Tocando agora", href: "/jukebox", icon: Radio },
  { title: "Pedir música", href: "/jukebox/pedir", icon: ListMusic },
  { title: "Bloqueios", href: "/jukebox/bloqueios", icon: Ban },
];

export const allNav = [...boardNav, ...jukeboxNav];
