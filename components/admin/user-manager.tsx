"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createUser, deleteUser, updateUser, type UserListItem } from "@/lib/actions/users";
import { UserFormDialog, type UserFormSubmitInput } from "@/components/admin/user-form-dialog";

interface UserManagerProps {
  initialUsers: UserListItem[];
  currentUserId: string;
}

const ROLE_LABEL: Record<string, string> = {
  coordinator: "Coordenador",
  member: "Responsável",
};

export function UserManager({ initialUsers, currentUserId }: UserManagerProps) {
  const [users, setUsers] = useState(initialUsers);
  const [, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UserListItem | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserListItem | null>(null);

  function handleSubmit(input: UserFormSubmitInput) {
    if (editing) {
      const id = editing.id;
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, name: input.name, role: input.role } : u))
      );
      startTransition(() => {
        updateUser(id, {
          name: input.name,
          role: input.role,
          password: input.password || undefined,
        })
          .then(() => toast.success("Usuário atualizado"))
          .catch((err) => toast.error(err.message || "Erro ao atualizar usuário"));
      });
    } else {
      startTransition(async () => {
        try {
          const created = await createUser(input);
          setUsers((prev) => [
            ...prev,
            {
              id: created.id,
              name: created.name,
              username: created.username,
              role: created.role,
              createdAt: created.createdAt,
            },
          ]);
          toast.success("Usuário criado");
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Erro ao criar usuário");
        }
      });
    }
  }

  function confirmDeleteUser() {
    if (!userToDelete) return;
    const user = userToDelete;
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    startTransition(() => {
      deleteUser(user.id)
        .then(() => toast.success("Usuário removido"))
        .catch((err) => toast.error(err.message || "Erro ao remover usuário"));
    });
  }

  return (
    <>
      <div className="flex justify-end">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                size="icon"
                aria-label="Novo usuário"
                onClick={() => {
                  setEditing(null);
                  setDialogOpen(true);
                }}
              />
            }
          >
            <Plus className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Novo usuário</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex flex-col gap-2 md:hidden">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="flex flex-col gap-3 p-3">
              <div className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate font-medium">{user.name}</span>
                {user.role === "coordinator" && (
                  <ShieldCheck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                )}
                {user.id === currentUserId && (
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs">
                    Você
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>@{user.username}</span>
                <span>{ROLE_LABEL[user.role] ?? user.role}</span>
              </div>
              <div className="flex justify-end gap-1">
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Editar usuário"
                  onClick={() => {
                    setEditing(user);
                    setDialogOpen(true);
                  }}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Excluir usuário"
                  disabled={user.id === currentUserId}
                  onClick={() => setUserToDelete(user)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {users.length === 0 && (
          <p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
            Nenhum usuário criado ainda.
          </p>
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {user.name}
                    {user.role === "coordinator" && (
                      <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                    {user.id === currentUserId && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">Você</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">@{user.username}</TableCell>
                <TableCell>{ROLE_LABEL[user.role] ?? user.role}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Editar usuário"
                      onClick={() => {
                        setEditing(user);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Excluir usuário"
                      disabled={user.id === currentUserId}
                      onClick={() => setUserToDelete(user)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                  Nenhum usuário criado ainda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <UserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editing}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={userToDelete !== null}
        onOpenChange={(open) => !open && setUserToDelete(null)}
        title="Excluir usuário"
        description={
          userToDelete
            ? `Tem certeza que deseja excluir "${userToDelete.name}"? As tarefas atribuídas a ele ficarão sem responsável.`
            : ""
        }
        confirmLabel="Excluir"
        onConfirm={confirmDeleteUser}
      />
    </>
  );
}
