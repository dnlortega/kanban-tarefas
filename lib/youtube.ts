export interface YoutubeSearchResult {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  genre?: string;
}

function humanizeTopic(topicUrl: string): string {
  const slug = topicUrl.split("/").pop() ?? "";
  return decodeURIComponent(slug).replace(/_/g, " ");
}

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&quot;": '"',
  "&#39;": "'",
  "&lt;": "<",
  "&gt;": ">",
};

function decodeHtmlEntities(text: string): string {
  return text.replace(/&amp;|&quot;|&#39;|&lt;|&gt;/g, (m) => HTML_ENTITIES[m]);
}

async function fetchGenresByVideoId(
  videoIds: string[],
  apiKey: string
): Promise<Record<string, string | undefined>> {
  if (videoIds.length === 0) return {};

  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "topicDetails");
  url.searchParams.set("id", videoIds.join(","));
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) return {};

  const data = await res.json();

  interface VideosApiItem {
    id: string;
    topicDetails?: { topicCategories?: string[] };
  }

  const genreById: Record<string, string | undefined> = {};
  for (const item of data.items as VideosApiItem[]) {
    const topics = item.topicDetails?.topicCategories ?? [];
    const preferred =
      topics.find((t) => !t.toLowerCase().endsWith("/music")) ?? topics[0];
    genreById[item.id] = preferred ? humanizeTopic(preferred) : undefined;
  }
  return genreById;
}

export async function searchYoutube(query: string): Promise<YoutubeSearchResult[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "YOUTUBE_API_KEY não configurada. Veja docs/youtube-api-key.md para instruções."
    );
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "8");
  url.searchParams.set("q", query);
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Erro na busca do YouTube (${res.status}): ${body.slice(0, 200)}`);
  }

  const data = await res.json();

  interface YoutubeApiItem {
    id: { videoId?: string };
    snippet: {
      title: string;
      channelTitle: string;
      thumbnails: { medium?: { url: string }; default?: { url: string } };
    };
  }

  const items = (data.items as YoutubeApiItem[]).filter(
    (item): item is YoutubeApiItem & { id: { videoId: string } } =>
      Boolean(item.id?.videoId)
  );
  const genreById: Record<string, string | undefined> = await fetchGenresByVideoId(
    items.map((item) => item.id.videoId),
    apiKey
  ).catch(() => ({}));

  return items.map((item) => ({
    videoId: item.id.videoId,
    title: decodeHtmlEntities(item.snippet.title),
    channel: decodeHtmlEntities(item.snippet.channelTitle),
    thumbnail:
      item.snippet.thumbnails.medium?.url ?? item.snippet.thumbnails.default?.url ?? "",
    genre: genreById[item.id.videoId],
  }));
}
