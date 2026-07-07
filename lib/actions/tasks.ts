"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import type { TaskInput } from "@/types/task";

export async function createTask(input: TaskInput) {
  const last = await prisma.task.findFirst({
    where: { columnId: input.columnId },
    orderBy: { order: "desc" },
  });

  await prisma.task.create({
    data: {
      title: input.title,
      description: input.description || null,
      assignee: input.assignee || null,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      columnId: input.columnId,
      order: last ? last.order + 1 : 0,
    },
  });

  revalidatePath("/");
}

export async function updateTask(id: string, input: TaskInput) {
  const existing = await prisma.task.findUniqueOrThrow({ where: { id } });

  let order = existing.order;
  if (existing.columnId !== input.columnId) {
    const last = await prisma.task.findFirst({
      where: { columnId: input.columnId },
      orderBy: { order: "desc" },
    });
    order = last ? last.order + 1 : 0;
  }

  await prisma.task.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description || null,
      assignee: input.assignee || null,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      columnId: input.columnId,
      order,
    },
  });

  revalidatePath("/");
}

export async function deleteTask(id: string) {
  await prisma.task.delete({ where: { id } });
  revalidatePath("/");
}

interface ColumnOrderPayload {
  columnId: string;
  taskIds: string[];
}

export async function syncColumnsOrder(payload: ColumnOrderPayload[]) {
  await prisma.$transaction(
    payload.flatMap(({ columnId, taskIds }) =>
      taskIds.map((id, index) =>
        prisma.task.update({
          where: { id },
          data: { columnId, order: index },
        })
      )
    )
  );
  revalidatePath("/");
}

export async function getTitleSuggestions(): Promise<string[]> {
  const tasks = await prisma.task.findMany({
    select: { title: true },
    distinct: ["title"],
    orderBy: { createdAt: "desc" },
  });
  return tasks.map((t) => t.title);
}
