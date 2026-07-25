"use server";

import { revalidatePath } from "next/cache";
import type { Track as PrismaTrack } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { searchYoutube } from "@/lib/youtube";
import { findMatchingBlock } from "@/lib/actions/blocklist";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import type { Track } from "@/types/jukebox";

function serialize(track: PrismaTrack): Track {
  return { ...track, createdAt: track.createdAt.toISOString() };
}

/**
 * Picks the next track to play with fair round-robin scheduling across requesters:
 * each requester's Nth track only competes with everyone else's Nth track, so a
 * new requester with few past requests jumps ahead of a requester who already had
 * many turns, instead of waiting behind their whole backlog.
 */
async function pickNextQueuedTrack(): Promise<PrismaTrack | null> {
  const queued = await prisma.track.findMany({
    where: { status: "queued" },
    orderBy: { order: "asc" },
  });
  if (queued.length <= 1) return queued[0] ?? null;

  const requesters = Array.from(
    new Set(queued.map((t) => t.requestedBy).filter((r): r is string => Boolean(r)))
  );
  if (requesters.length <= 1) return queued[0];

  const history = await prisma.track.findMany({
    where: { requestedBy: { in: requesters } },
    select: { id: true, requestedBy: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const roundByTrackId = new Map<string, number>();
  const counters = new Map<string, number>();
  for (const row of history) {
    const key = row.requestedBy as string;
    const round = counters.get(key) ?? 0;
    roundByTrackId.set(row.id, round);
    counters.set(key, round + 1);
  }

  let best = queued[0];
  let bestRound = roundByTrackId.get(best.id) ?? 0;
  for (const track of queued.slice(1)) {
    const round = roundByTrackId.get(track.id) ?? 0;
    if (round < bestRound) {
      best = track;
      bestRound = round;
    }
  }
  return best;
}

export async function searchTracks(query: string) {
  const ip = await getClientIp();
  await checkRateLimit("jukebox-search", ip, 20, 5);

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
  const ip = await getClientIp();
  await checkRateLimit("jukebox-request", ip, 10, 5);

  const blockedTerm = await findMatchingBlock(input.title);
  if (blockedTerm) {
    throw new Error(`Essa música está bloqueada (termo: "${blockedTerm}").`);
  }

  const alreadyQueued = await prisma.track.findFirst({
    where: { youtubeId: input.videoId, status: { in: ["queued", "playing"] } },
  });
  if (alreadyQueued) {
    throw new Error("Essa música já está na fila.");
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
  const playing = await prisma.track.findFirst({ where: { status: "playing" } });
  const queued = await prisma.track.findMany({
    where: { status: "queued" },
    orderBy: { order: "asc" },
  });

  return {
    playing: playing ? serialize(playing) : null,
    queued: queued.map(serialize),
  };
}

export async function ensurePlaybackStarted() {
  const current = await prisma.track.findFirst({ where: { status: "playing" } });
  if (current) return serialize(current);

  const next = await pickNextQueuedTrack();
  if (!next) return null;

  const updated = await prisma.track.update({
    where: { id: next.id },
    data: { status: "playing", playedAt: new Date() },
  });

  return serialize(updated);
}

export async function advanceQueue(finishedTrackId?: string, repeatAll: boolean = false) {
  if (finishedTrackId) {
    const finishedTrack = await prisma.track.findUnique({ where: { id: finishedTrackId } });
    
    await prisma.track.updateMany({
      where: { id: finishedTrackId, status: "playing" },
      data: { status: "done" },
    });

    if (repeatAll && finishedTrack) {
      const last = await prisma.track.findFirst({
        where: { status: "queued" },
        orderBy: { order: "desc" },
      });
      await prisma.track.create({
        data: {
          youtubeId: finishedTrack.youtubeId,
          title: finishedTrack.title,
          channel: finishedTrack.channel,
          thumbnail: finishedTrack.thumbnail,
          genre: finishedTrack.genre,
          requestedBy: finishedTrack.requestedBy,
          status: "queued",
          order: last ? last.order + 1 : 0,
        },
      });
    }
  }

  const next = await pickNextQueuedTrack();

  let updated: Track | null = null;
  if (next) {
    updated = serialize(
      await prisma.track.update({
        where: { id: next.id },
        data: { status: "playing", playedAt: new Date() },
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

export async function clearHistory() {
  await prisma.track.deleteMany({
    where: { status: "done" },
  });
  revalidatePath("/jukebox");
}

export async function playPrevious(currentTrackId?: string) {
  const previous = await prisma.track.findFirst({
    where: { status: "done" },
    orderBy: { playedAt: "desc" },
  });
  if (!previous) return null;

  if (currentTrackId) {
    const first = await prisma.track.findFirst({
      where: { status: "queued" },
      orderBy: { order: "asc" },
    });
    await prisma.track.updateMany({
      where: { id: currentTrackId, status: "playing" },
      data: { status: "queued", order: first ? first.order - 1 : 0 },
    });
  }

  const updated = await prisma.track.update({
    where: { id: previous.id },
    data: { status: "playing", playedAt: new Date() },
  });

  revalidatePath("/jukebox");
  revalidatePath("/jukebox/pedir");
  return serialize(updated);
}

export async function removeFromQueue(trackId: string) {
  await prisma.track.deleteMany({ where: { id: trackId, status: "queued" } });
  revalidatePath("/jukebox");
  revalidatePath("/jukebox/pedir");
}

export async function reorderQueue(orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.track.update({
        where: { id, status: "queued" },
        data: { order: index },
      })
    )
  );
  revalidatePath("/jukebox");
  revalidatePath("/jukebox/pedir");
}

export async function getRecentlyPlayed(limit = 10) {
  const tracks = await prisma.track.findMany({
    where: { status: "done" },
    orderBy: [{ playedAt: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
  return tracks.map(serialize);
}

export async function requeueTrack(trackId: string) {
  const trackToRequeue = await prisma.track.findUnique({ where: { id: trackId } });
  if (!trackToRequeue) return;

  const last = await prisma.track.findFirst({
    where: { status: "queued" },
    orderBy: { order: "desc" },
  });

  await prisma.track.create({
    data: {
      youtubeId: trackToRequeue.youtubeId,
      title: trackToRequeue.title,
      channel: trackToRequeue.channel,
      thumbnail: trackToRequeue.thumbnail,
      genre: trackToRequeue.genre,
      requestedBy: trackToRequeue.requestedBy,
      status: "queued",
      order: last ? last.order + 1 : 0,
    },
  });

  revalidatePath("/jukebox");
  revalidatePath("/jukebox/pedir");
}

export async function shuffleQueue() {
  const queued = await prisma.track.findMany({
    where: { status: "queued" },
    orderBy: { order: "asc" },
  });

  if (queued.length <= 1) return;

  // Fisher-Yates shuffle
  const shuffled = [...queued];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }

  await prisma.$transaction(
    shuffled.map((track, index) =>
      prisma.track.update({
        where: { id: track.id },
        data: { order: index },
      })
    )
  );

  revalidatePath("/jukebox");
  revalidatePath("/jukebox/pedir");
}
