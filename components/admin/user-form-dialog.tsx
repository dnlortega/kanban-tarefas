"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserListItem } from "@/lib/actions/users";

type Role = "coordinator" | "member";

const ROLE_ITEMS = [
  { value: "member", label: "Responsável" },
  { value: "coordinator", label: "Coordenador" },
];

export interface UserFormSubmitInput {
  name: string;
  username: string;
  password: string;
  role: Role;
}

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserListItem | null;
  onSubmit: (input: UserFormSubmitInput) => void;
}

export function UserFormDialog({ open, onOpenChange, user, onSubmit }: UserFormDialogProps) {
  const isEditing = Boolean(user);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar usuário" : "Novo usuário"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Deixe a senha em branco para mantê-la sem alteração."
              : "Coordenadores podem criar tarefas e gerenciar usuários. Responsáveis só movem as próprias tarefas."}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <UserForm
            user={user}
            isEditing={isEditing}
            onCancel={() => onOpenChange(false)}
            onSubmit={(input) => {
              onSubmit(input);
              onOpenChange(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function UserForm({
  user,
  isEditing,
  onCancel,
  onSubmit,
}: {
  user: UserListItem | null;
  isEditing: boolean;
  onCancel: () => void;
  onSubmit: (input: UserFormSubmitInput) => void;
}) {
  const [name, setName] = useState(user?.name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>((user?.role as Role) ?? "member");

  const canSubmit =
    name.trim().length > 0 &&
    (isEditing || username.trim().length > 0) &&
    (isEditing || password.length >= 6);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ name: name.trim(), username: username.trim(), password, role });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-2">
        <div className="grid gap-1.5">
          <Label htmlFor="user-name">Nome</Label>
          <Input
            id="user-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Ana Souza"
            autoFocus
            required
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="user-username">Usuário</Label>
          <Input
            id="user-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ex: ana"
            disabled={isEditing}
            required={!isEditing}
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="user-password">
            {isEditing ? "Nova senha (opcional)" : "Senha"}
          </Label>
          <Input
            id="user-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required={!isEditing}
          />
        </div>

        <div className="grid gap-1.5">
          <Label>Papel</Label>
          <Select value={role} onValueChange={(v) => setRole(v as Role)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_ITEMS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Cancelar"
              onClick={onCancel}
            >
              <X className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Cancelar</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="submit"
              size="icon"
              disabled={!canSubmit}
              aria-label={isEditing ? "Salvar alterações" : "Criar usuário"}
            >
              <Check className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isEditing ? "Salvar alterações" : "Criar usuário"}
          </TooltipContent>
        </Tooltip>
      </DialogFooter>
    </form>
  );
}
