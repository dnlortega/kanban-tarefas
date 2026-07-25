import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, Music } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  return (
    <main className="flex min-h-0 flex-1 flex-col p-8 space-y-8 overflow-y-auto bg-background">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo, {currentUser.name}!</h1>
        <p className="text-muted-foreground mt-2">Aqui está o resumo do seu dia e as atividades do sistema.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Minhas Tarefas */}
        <Card className="hover:border-primary/50 transition-colors border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minhas Tarefas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">...</div>
            <p className="text-xs text-muted-foreground mt-1">Em andamento e pendentes</p>
            <Link href="/kanban" className="text-xs text-primary mt-4 inline-block hover:underline font-medium">
              Acessar Kanban &rarr;
            </Link>
          </CardContent>
        </Card>

        {/* Prazos Próximos */}
        <Card className="hover:border-primary/50 transition-colors border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prazos Críticos</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">...</div>
            <p className="text-xs text-muted-foreground mt-1">Tarefas vencendo na equipe</p>
          </CardContent>
        </Card>

        {/* Jukebox */}
        <Card className="hover:border-primary/50 transition-colors border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tocando Agora</CardTitle>
            <Music className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">...</div>
            <p className="text-xs text-muted-foreground mt-1">Status da Jukebox</p>
            <Link href="/jukebox" className="text-xs text-primary mt-4 inline-block hover:underline font-medium">
              Abrir Player &rarr;
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
