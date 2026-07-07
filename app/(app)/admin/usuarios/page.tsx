import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { getUsers } from "@/lib/actions/users";
import { UserManager } from "@/components/admin/user-manager";

export const dynamic = "force-dynamic";

export default async function UsersAdminPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "coordinator") {
    redirect("/");
  }

  const users = await getUsers();

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background p-4 sm:p-6">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Administração de usuários
          </h1>
          <p className="text-sm text-muted-foreground">
            Crie contas para cada responsável e para o coordenador. Só coordenadores podem
            criar e atribuir tarefas.
          </p>
        </div>

        <UserManager initialUsers={users} currentUserId={currentUser.id} />
      </div>
    </main>
  );
}
