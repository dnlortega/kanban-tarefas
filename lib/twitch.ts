export interface TwitchChannel {
  id: string;
  login: string;
  displayName: string;
  thumbnail: string;
  isLive: boolean;
}

export interface TwitchStream {
  userId: string;
  userLogin: string;
  userName: string;
  title: string;
  gameName: string;
  viewerCount: number;
  thumbnail: string;
  startedAt: string;
}

export interface TwitchClip {
  id: string;
  url: string;
  embedUrl: string;
  title: string;
  thumbnail: string;
  viewCount: number;
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAppAccessToken(): Promise<string> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "TWITCH_CLIENT_ID/TWITCH_CLIENT_SECRET não configuradas. Veja docs/twitch-api-key.md para instruções."
    );
  }

  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const url = new URL("https://id.twitch.tv/oauth2/token");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("client_secret", clientSecret);
  url.searchParams.set("grant_type", "client_credentials");

  const res = await fetch(url.toString(), { method: "POST" });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Erro ao autenticar na Twitch (${res.status}): ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  cachedToken = {
    value: data.access_token,
    // Renova 1 minuto antes de expirar de verdade.
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.value;
}

async function twitchFetch(path: string, params: Record<string, string | string[]>) {
  const clientId = process.env.TWITCH_CLIENT_ID;
  if (!clientId) {
    throw new Error(
      "TWITCH_CLIENT_ID/TWITCH_CLIENT_SECRET não configuradas. Veja docs/twitch-api-key.md para instruções."
    );
  }
  const token = await getAppAccessToken();

  const url = new URL(`https://api.twitch.tv/helix/${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const v of value) url.searchParams.append(key, v);
    } else {
      url.searchParams.set(key, value);
    }
  }

  const res = await fetch(url.toString(), {
    headers: {
      "Client-Id": clientId,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Erro na API da Twitch (${res.status}): ${body.slice(0, 200)}`);
  }
  return res.json();
}

export async function searchTwitchChannels(query: string): Promise<TwitchChannel[]> {
  const data = await twitchFetch("search/channels", { query, first: "8" });

  interface ChannelItem {
    id: string;
    broadcaster_login: string;
    display_name: string;
    thumbnail_url: string;
    is_live: boolean;
  }

  return (data.data as ChannelItem[]).map((item) => ({
    id: item.id,
    login: item.broadcaster_login,
    displayName: item.display_name,
    thumbnail: item.thumbnail_url,
    isLive: item.is_live,
  }));
}

export async function getStreamsByLogins(logins: string[]): Promise<TwitchStream[]> {
  if (logins.length === 0) return [];
  const data = await twitchFetch("streams", { user_login: logins, first: "20" });

  interface StreamItem {
    user_id: string;
    user_login: string;
    user_name: string;
    title: string;
    game_name: string;
    viewer_count: number;
    thumbnail_url: string;
    started_at: string;
  }

  return (data.data as StreamItem[]).map((item) => ({
    userId: item.user_id,
    userLogin: item.user_login,
    userName: item.user_name,
    title: item.title,
    gameName: item.game_name,
    viewerCount: item.viewer_count,
    thumbnail: item.thumbnail_url.replace("{width}", "320").replace("{height}", "180"),
    startedAt: item.started_at,
  }));
}

export async function getTopClips(broadcasterId: string): Promise<TwitchClip[]> {
  const data = await twitchFetch("clips", { broadcaster_id: broadcasterId, first: "12" });

  interface ClipItem {
    id: string;
    url: string;
    embed_url: string;
    title: string;
    thumbnail_url: string;
    view_count: number;
  }

  return (data.data as ClipItem[]).map((item) => ({
    id: item.id,
    url: item.url,
    embedUrl: item.embed_url,
    title: item.title,
    thumbnail: item.thumbnail_url,
    viewCount: item.view_count,
  }));
}
