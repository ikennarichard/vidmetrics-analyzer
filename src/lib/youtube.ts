const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

export async function fetchChannelVideos(channelId: string) {
  const searchRes = await fetch(
    `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${channelId}&part=snippet&order=date&maxResults=10`,
  );

  const searchData = await searchRes.json();

  const videoIds = searchData.items
    .map((item: any) => item.id.videoId)
    .filter(Boolean)
    .join(",");

  const videosRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&id=${videoIds}&part=snippet,statistics`,
  );

  const videosData = await videosRes.json();

  return videosData.items;
}

export function extractChannelInfo(url: string) {
  const trimmed = url.trim();

  if (/^UC[\w-]{20,}$/.test(trimmed)) {
    return { type: "id", value: trimmed };
  }

  if (!trimmed.startsWith("http")) {
    return { type: "search", value: trimmed };
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.pathname === "/watch" && parsed.searchParams.get("v")) {
      return { type: "video", value: parsed.searchParams.get("v")! };
    }

    if (parsed.hostname === "youtu.be") {
      return { type: "video", value: parsed.pathname.slice(1) };
    }

    if (parsed.pathname.startsWith("/channel/")) {
      return { type: "id", value: parsed.pathname.split("/")[2] };
    }

    if (parsed.pathname.startsWith("/@")) {
      return { type: "handle", value: parsed.pathname.slice(2) };
    }

    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length > 0) {
      return { type: "custom", value: parts[parts.length === 1 ? 0 : 1] };
    }

    return null;
  } catch {
    return null;
  }
}

export function calculateScore(video: any) {
  const views = Number(video.statistics.viewCount || 0);
  const likes = Number(video.statistics.likeCount || 0);
  const comments = Number(video.statistics.commentCount || 0);

  if (views === 0) return 0;

  const engagementRate = (likes + comments) / views;

  return Math.round(views * engagementRate);
}

export async function getChannelIdFromVideo(videoId: string): Promise<string> {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`,
  );
  const data = await res.json();
  return data.items?.[0]?.snippet?.channelId;
}

export async function searchChannelByName(query: string): Promise<string> {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=1&key=${API_KEY}`,
  );
  const data = await res.json();
  return data.items?.[0]?.snippet?.channelId;
}

export async function resolveHandle(handle: string): Promise<string> {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${handle}&key=${API_KEY}`,
  );
  const data = await res.json();
  return data.items?.[0]?.id;
}
