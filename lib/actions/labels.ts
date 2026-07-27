"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCoordinator } from "@/lib/session";

export async function getLabels() {
  return prisma.label.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createLabel(name: string, color: string) {
  await requireCoordinator();
  
  const existing = await prisma.label.findFirst({
    where: { name: { equals: name, mode: "insensitive" } }
  });
  
  if (existing) {
    throw new Error("Uma etiqueta com este nome já existe");
  }

  const label = await prisma.label.create({
    data: { name, color }
  });
  
  revalidatePath("/");
  return label;
}

export async function deleteLabel(id: string) {
  await requireCoordinator();
  await prisma.label.delete({ where: { id } });
  revalidatePath("/");
}
