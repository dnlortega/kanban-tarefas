"use server";

import { getStreamsByLogins, getTopClips, searchTwitchChannels } from "@/lib/twitch";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

export async function searchChannels(query: string) {
  const ip = await getClientIp();
  await checkRateLimit("twitch-search", ip, 20, 5);

  const channels = await searchTwitchChannels(query);
  const liveLogins = channels.filter((c) => c.isLive).map((c) => c.login);
  const streams = await getStreamsByLogins(liveLogins);
  const streamByLogin = new Map(streams.map((s) => [s.userLogin, s]));

  return channels.map((channel) => ({
    channel,
    stream: streamByLogin.get(channel.login) ?? null,
  }));
}

export async function getClips(broadcasterId: string) {
  return getTopClips(broadcasterId);
}
