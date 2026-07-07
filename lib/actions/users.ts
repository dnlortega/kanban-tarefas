"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { requireCoordinator } from "@/lib/session";

export interface UserListItem {
  id: string;
  name: string;
  username: string;
  role: string;
  createdAt: Date;
}

export async function getUsers(): Promise<UserListItem[]> {
  await requireCoordinator();

  return prisma.user.findMany({
    select: { id: true, name: true, username: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
}

export interface CreateUserInput {
  name: string;
  username: string;
  password: string;
  role: "coordinator" | "member";
}

export async function createUser(input: CreateUserInput) {
  await requireCoordinator();

  const username = input.username.trim().toLowerCase();
  if (!username || !input.name.trim() || !input.password) {
    throw new Error("Preencha nome, usuário e senha.");
  }
  if (input.password.length < 6) {
    throw new Error("A senha deve ter pelo menos 6 caracteres.");
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    throw new Error("Já existe um usuário com esse nome de usuário.");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      username,
      passwordHash,
      role: input.role,
    },
  });

  revalidatePath("/admin/usuarios");

  return user;
}

export interface UpdateUserInput {
  name: string;
  role: "coordinator" | "member";
  password?: string;
}

export async function updateUser(id: string, input: UpdateUserInput) {
  const actor = await requireCoordinator();

  if (actor.id === id && input.role !== "coordinator") {
    throw new Error("Você não pode remover seu próprio papel de coordenador.");
  }

  if (!input.name.trim()) {
    throw new Error("Informe um nome.");
  }
  if (input.password && input.password.length < 6) {
    throw new Error("A senha deve ter pelo menos 6 caracteres.");
  }

  await prisma.user.update({
    where: { id },
    data: {
      name: input.name.trim(),
      role: input.role,
      ...(input.password ? { passwordHash: await hashPassword(input.password) } : {}),
    },
  });

  revalidatePath("/admin/usuarios");
}

export async function deleteUser(id: string) {
  const actor = await requireCoordinator();

  if (actor.id === id) {
    throw new Error("Você não pode excluir sua própria conta.");
  }

  await prisma.user.delete({ where: { id } });

  revalidatePath("/admin/usuarios");
  revalidatePath("/");
}
