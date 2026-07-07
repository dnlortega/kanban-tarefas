"use server";

import { revalidatePath } from "next/cache";
import type { Track as PrismaTrack } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { searchYoutube } from "@/lib/youtube";
import { findMatchingBlock } from "@/lib/actions/blocklist";
import type { Track } from "@/types/jukebox";

function serialize(track: PrismaTrack): Track {
  return { ...track, createdAt: track.createdAt.toISOString() };
}

export async function searchTracks(query: string) {
  const results = await searchYoutube(query);
  const blocked = await prisma.blockedSong.findMany();

  return results.map((r) => {
    const lowerTitle = r.title.toLowerCase();
    const match = blocked.find((b) => lowerTitle.includes(b.term.toLowerCase()));
    return { ...r, blocked: Boolean(match) };
  });
}

interface RequestTrackInput {
  videoId: string;
  title: string;
  channel?: string;
  thumbnail?: string;
  genre?: string;
  requestedBy?: string;
}

export async function requestTrack(input: RequestTrackInput) {
  const blockedTerm = await findMatchingBlock(input.title);
  if (blockedTerm) {
    throw new Error(`Essa música está bloqueada (termo: "${blockedTerm}").`);
  }

  const last = await prisma.track.findFirst({
    where: { status: "queued" },
    orderBy: { order: "desc" },
  });

  const track = await prisma.track.create({
    data: {
      youtubeId: input.videoId,
      title: input.title,
      channel: input.channel || null,
      thumbnail: input.thumbnail || null,
      genre: input.genre || null,
      requestedBy: input.requestedBy || null,
      status: "queued",
      order: last ? last.order + 1 : 0,
    },
  });

  revalidatePath("/jukebox");
  revalidatePath("/jukebox/pedir");

  return serialize(track);
}

export async function getQueueState() {
  const [playing, queued] = await Promise.all([
    prisma.track.findFirst({ where: { status: "playing" } }),
    prisma.track.findMany({
      where: { status: "queued" },
      orderBy: { order: "asc" },
    }),
  ]);

  return {
    playing: playing ? serialize(playing) : null,
    queued: queued.map(serialize),
  };
}

export async function ensurePlaybackStarted() {
  const current = await prisma.track.findFirst({ where: { status: "playing" } });
  if (current) return serialize(current);

  const next = await prisma.track.findFirst({
    where: { status: "queued" },
    orderBy: { order: "asc" },
  });
  if (!next) return null;

  const updated = await prisma.track.update({
    where: { id: next.id },
    data: { status: "playing" },
  });

  revalidatePath("/jukebox");
  revalidatePath("/jukebox/pedir");
  return serialize(updated);
}

export async function advanceQueue(finishedTrackId?: string) {
  if (finishedTrackId) {
    await prisma.track.updateMany({
      where: { id: finishedTrackId, status: "playing" },
      data: { status: "done" },
    });
  }

  const next = await prisma.track.findFirst({
    where: { status: "queued" },
    orderBy: { order: "asc" },
  });

  let updated: Track | null = null;
  if (next) {
    updated = serialize(
      await prisma.track.update({
        where: { id: next.id },
        data: { status: "playing" },
      })
    );
  }

  revalidatePath("/jukebox");
  revalidatePath("/jukebox/pedir");
  return updated;
}

export async function skipTrack(trackId: string) {
  return advanceQueue(trackId);
}

export async function removeFromQueue(trackId: string) {
  await prisma.track.deleteMany({ where: { id: trackId, status: "queued" } });
  revalidatePath("/jukebox");
  revalidatePath("/jukebox/pedir");
}
