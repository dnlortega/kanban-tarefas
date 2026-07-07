"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export async function listBlockedSongs() {
  return prisma.blockedSong.findMany({ orderBy: { createdAt: "desc" } });
}

export async function addBlockedSong(term: string) {
  const trimmed = term.trim();
  if (!trimmed) throw new Error("Informe um termo para bloquear.");

  const existing = await prisma.blockedSong.findFirst({
    where: { term: { equals: trimmed } },
  });
  if (existing) throw new Error("Esse termo já está bloqueado.");

  const created = await prisma.blockedSong.create({ data: { term: trimmed } });
  revalidatePath("/jukebox/bloqueios");
  return created;
}

export async function removeBlockedSong(id: string) {
  await prisma.blockedSong.delete({ where: { id } });
  revalidatePath("/jukebox/bloqueios");
}

export async function findMatchingBlock(title: string): Promise<string | null> {
  const blocked = await prisma.blockedSong.findMany();
  const lowerTitle = title.toLowerCase();
  const match = blocked.find((b) => lowerTitle.includes(b.term.toLowerCase()));
  return match ? match.term : null;
}
