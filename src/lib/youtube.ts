const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = "https://www.googleapis.com/youtube/v3";

// ---- helpers ----

async function yt(endpoint: string, params: Record<string, string>) {
  const query = new URLSearchParams({ ...params, key: API_KEY }).toString();
  const r = await fetch(`${BASE_URL}/${endpoint}?${query}`);
  const data = await r.json();
  if (data.error?.errors?.[0]?.reason === "quotaExceeded") {
    throw new Error("QUOTA_EXCEEDED");
  }
  return data;
}

// ---- resolvers ----

export function extractChannelInfo(url: string) {
  const trimmed = url.trim();

  if (/^UC[\w-]{20,}$/.test(trimmed)) return { type: "id", value: trimmed };
  if (!trimmed.startsWith("http")) return { type: "search", value: trimmed };

  try {
    const { pathname, hostname, searchParams } = new URL(trimmed);

    if (hostname === "youtu.be")
      return { type: "video", value: pathname.slice(1) };
    if (pathname === "/watch" && searchParams.get("v"))
      return { type: "video", value: searchParams.get("v")! };
    if (pathname.startsWith("/channel/"))
      return { type: "id", value: pathname.split("/")[2] };
    if (pathname.startsWith("/@"))
      return { type: "handle", value: pathname.slice(2) };

    const parts = pathname.split("/").filter(Boolean);
    if (parts.length > 0)
      return { type: "custom", value: parts[parts.length === 1 ? 0 : 1] };

    return null;
  } catch {
    return null;
  }
}

export async function resolveHandle(handle: string): Promise<string> {
  const data = await yt("channels", { part: "id", forHandle: handle });
  return data.items?.[0]?.id;
}

export async function getChannelIdFromVideo(videoId: string): Promise<string> {
  const data = await yt("videos", { part: "snippet", id: videoId });
  return data.items?.[0]?.snippet?.channelId;
}

export async function searchChannelByName(query: string): Promise<string> {
  const data = await yt("search", {
    part: "snippet",
    type: "channel",
    q: query,
    maxResults: "1",
  });
  return data.items?.[0]?.id?.channelId;
}

export async function fetchChannelInfo(channelId: string) {
  const data = await yt("channels", { part: "snippet", id: channelId });
  const channel = data.items?.[0];

  if (!channel) throw new Error("Channel not found");

  return {
    id: channel.id,
    name: channel.snippet.title,
    thumbnail: channel.snippet.thumbnails.default.url,
  };
}

// ---- data ----

export async function fetchChannelVideos(channelId: string) {
  const searchData = await yt("search", {
    part: "snippet",
    channelId,
    order: "date",
    maxResults: "10",
  });

  const videoIds = searchData.items
    .map((item: any) => item.id.videoId)
    .filter(Boolean)
    .join(",");

  const videosData = await yt("videos", {
    part: "snippet,statistics,contentDetails",
    id: videoIds,
  });

  return videosData.items;
}

// ---- scoring ----

export function calculateScore(video: any) {
  const views = Number(video.statistics.viewCount || 0);
  const likes = Number(video.statistics.likeCount || 0);
  const comments = Number(video.statistics.commentCount || 0);

  if (views === 0) return 0;

  const daysOld = Math.max(
    1,
    Math.floor(
      (Date.now() - new Date(video.snippet.publishedAt).getTime()) / 86400000,
    ),
  );

  const engagementRate = (likes + comments) / views;
  const velocity = views / daysOld;

  return Math.round((engagementRate * 0.6 + (velocity / 100000) * 0.4) * 10000);
}

export async function resolveCustomUrl(username: string): Promise<string> {
  const data = await yt("channels", { part: "id", forUsername: username });
  if (data.items?.[0]?.id) return data.items[0].id;
  return searchChannelByName(username);
}
