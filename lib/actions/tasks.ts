"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireCoordinator } from "@/lib/session";
import type { ColumnWithTasks, TaskInput } from "@/types/task";

export async function getBoardState(): Promise<ColumnWithTasks[]> {
  const columns = await prisma.column.findMany({
    orderBy: { order: "asc" },
    include: {
      tasks: {
        orderBy: { order: "asc" },
        include: { assignee: { select: { id: true, name: true } } },
      },
    },
  });

  return columns.map((col) => ({
    id: col.id,
    title: col.title,
    color: col.color,
    isDone: col.isDone,
    order: col.order,
    tasks: col.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      assignee: task.assignee,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      order: task.order,
      columnId: task.columnId,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    })),
  }));
}

export async function createTask(input: TaskInput) {
  await requireCoordinator();

  const last = await prisma.task.findFirst({
    where: { columnId: input.columnId },
    orderBy: { order: "desc" },
  });

  await prisma.task.create({
    data: {
      title: input.title,
      description: input.description || null,
      assigneeId: input.assigneeId || null,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      columnId: input.columnId,
      order: last ? last.order + 1 : 0,
    },
  });

  revalidatePath("/");
}

export async function updateTask(id: string, input: TaskInput) {
  await requireCoordinator();

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
      assigneeId: input.assigneeId || null,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      columnId: input.columnId,
      order,
    },
  });

  revalidatePath("/");
}

export async function deleteTask(id: string) {
  await requireCoordinator();
  await prisma.task.delete({ where: { id } });
  revalidatePath("/");
}

interface ColumnOrderPayload {
  columnId: string;
  taskIds: string[];
}

export async function syncColumnsOrder(payload: ColumnOrderPayload[]) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Não autenticado");

  if (user.role !== "coordinator") {
    const allTaskIds = payload.flatMap((p) => p.taskIds);
    const tasks = await prisma.task.findMany({
      where: { id: { in: allTaskIds } },
      select: { id: true, columnId: true, assigneeId: true },
    });
    const taskById = new Map(tasks.map((t) => [t.id, t]));

    for (const { columnId, taskIds } of payload) {
      for (const taskId of taskIds) {
        const task = taskById.get(taskId);
        if (!task) continue;
        const isMoving = task.columnId !== columnId;
        if (isMoving && task.assigneeId !== user.id) {
          throw new Error("Você só pode mover as suas próprias tarefas.");
        }
      }
    }
  }

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
