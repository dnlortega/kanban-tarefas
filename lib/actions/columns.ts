"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export interface ColumnInput {
  title: string;
  color: string;
  isDone: boolean;
}

export async function createColumn(input: ColumnInput) {
  const last = await prisma.column.findFirst({ orderBy: { order: "desc" } });

  const column = await prisma.column.create({
    data: {
      title: input.title,
      color: input.color,
      isDone: input.isDone,
      order: last ? last.order + 1 : 0,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");

  return { ...column, taskCount: 0 };
}

export async function updateColumn(id: string, input: ColumnInput) {
  await prisma.column.update({
    where: { id },
    data: {
      title: input.title,
      color: input.color,
      isDone: input.isDone,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteColumn(id: string) {
  const taskCount = await prisma.task.count({ where: { columnId: id } });
  if (taskCount > 0) {
    throw new Error(
      "Não é possível excluir uma coluna com tarefas. Mova ou exclua as tarefas primeiro."
    );
  }

  await prisma.column.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function moveColumn(id: string, direction: "up" | "down") {
  const columns = await prisma.column.findMany({ orderBy: { order: "asc" } });
  const index = columns.findIndex((c) => c.id === id);
  if (index === -1) return;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= columns.length) return;

  const current = columns[index];
  const swapWith = columns[swapIndex];

  await prisma.$transaction([
    prisma.column.update({
      where: { id: current.id },
      data: { order: swapWith.order },
    }),
    prisma.column.update({
      where: { id: swapWith.id },
      data: { order: current.order },
    }),
  ]);

  revalidatePath("/");
  revalidatePath("/admin");
}
