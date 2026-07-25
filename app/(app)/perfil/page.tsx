import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <main className="flex min-h-0 flex-1 flex-col p-8 space-y-8 overflow-y-auto bg-background">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground mt-2">Gerencie suas informações pessoais e preferências.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Informações Públicas</CardTitle>
            <CardDescription>Como você aparecerá para os outros membros da equipe.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={currentUser.avatarUrl || ""} alt={currentUser.name} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-2 flex-1">
                <Label htmlFor="avatarUrl">URL da Foto (Avatar)</Label>
                <Input id="avatarUrl" placeholder="https://exemplo.com/minha-foto.jpg" defaultValue={currentUser.avatarUrl || ""} />
                <p className="text-xs text-muted-foreground">Cole o link direto para a sua imagem.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografia</Label>
              <Textarea id="bio" placeholder="Escreva um pouco sobre você..." defaultValue={currentUser.bio || ""} className="resize-none" rows={4} />
            </div>

            <Button className="w-full sm:w-auto">Salvar Alterações</Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Dados da Conta</CardTitle>
            <CardDescription>Informações de registro no sistema.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input value={currentUser.name} disabled />
            </div>
            <div className="space-y-2">
              <Label>Nome de Usuário</Label>
              <Input value={currentUser.username} disabled />
            </div>
            <div className="space-y-2">
              <Label>Nível de Acesso</Label>
              <Input value={currentUser.role === "coordinator" ? "Coordenador" : "Membro"} disabled />
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
