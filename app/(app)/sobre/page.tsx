import {
  Ban,
  Calendar,
  KanbanSquare,
  ListMusic,
  Radio,
  Send,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-static";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: KanbanSquare,
    title: "Quadro Kanban",
    description:
      "Colunas configuráveis, tarefas com responsável e prazo, busca e filtros. Só o coordenador cria/edita/exclui; só quem está atribuído a uma tarefa muda sua situação.",
  },
  {
    icon: Calendar,
    title: "Calendário",
    description:
      "Visão mensal com as tarefas no dia do prazo. Coordenador arrasta para reagendar; responsável só visualiza.",
  },
  {
    icon: Send,
    title: "Atribuir tarefas",
    description:
      "Tela do coordenador para distribuir tarefas pendentes arrastando até a pessoa responsável.",
  },
  {
    icon: Settings,
    title: "Administração de colunas",
    description: "Criar, renomear, colorir, marcar como conclusão e reordenar os status do quadro.",
  },
  {
    icon: Users,
    title: "Usuários",
    description: "Contas individuais (usuário + senha) com papel de coordenador ou responsável.",
  },
  {
    icon: Radio,
    title: "Tocando agora",
    description:
      "Player de música com fila justa por rodízio entre quem pediu, controles de reprodução e histórico.",
  },
  {
    icon: ListMusic,
    title: "Pedir música",
    description: "Busca e pedido de músicas do YouTube — pública, não exige login.",
  },
  {
    icon: Ban,
    title: "Bloqueios",
    description: "Lista de termos que não podem ser pedidos nem tocados no jukebox.",
  },
];

const STACK_GROUPS: { label: string; items: string[] }[] = [
  {
    label: "Framework e linguagem",
    items: ["Next.js 16 (App Router, Server Actions)", "React 19", "TypeScript"],
  },
  {
    label: "Interface",
    items: ["Tailwind CSS v4", "shadcn/ui (estilo base-nova, sobre Base UI)", "@dnd-kit (drag and drop)", "date-fns"],
  },
  {
    label: "Dados",
    items: ["Prisma ORM", "PostgreSQL (Neon)"],
  },
  {
    label: "Integrações",
    items: ["YouTube Data API v3", "YouTube IFrame Player API"],
  },
  {
    label: "Infraestrutura e qualidade",
    items: ["Vercel (hospedagem + Analytics)", "Playwright (testes end-to-end)", "GitHub Actions (CI)"],
  },
];

export default function AboutPage() {
  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 p-4 sm:p-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Sobre este sistema
          </h1>
          <p className="text-sm text-muted-foreground">
            O que a Central de Tarefas & Jukebox faz e com o que ela foi construída.
          </p>
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Funcionalidades</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <Card key={feature.title}>
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{feature.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Tecnologias utilizadas</h2>
          <Card>
            <CardContent className="flex flex-col gap-4 p-4">
              {STACK_GROUPS.map((group) => (
                <div key={group.label} className="flex flex-col gap-2">
                  <p className="text-xs font-medium text-muted-foreground">{group.label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <Badge key={item} variant="secondary">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
