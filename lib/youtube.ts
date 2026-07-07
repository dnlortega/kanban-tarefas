export interface YoutubeSearchResult {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
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
    id: { videoId: string };
    snippet: {
      title: string;
      channelTitle: string;
      thumbnails: { medium?: { url: string }; default?: { url: string } };
    };
  }

  return (data.items as YoutubeApiItem[]).map((item) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    thumbnail:
      item.snippet.thumbnails.medium?.url ?? item.snippet.thumbnails.default?.url ?? "",
  }));
}
