const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

export async function fetchChannelVideos(channelId: string) {
  const searchRes = await fetch(
    `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${channelId}&part=snippet&order=date&maxResults=10`
  );

  const searchData = await searchRes.json();

  const videoIds = searchData.items
    .map((item: any) => item.id.videoId)
    .filter(Boolean)
    .join(",");

  const videosRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&id=${videoIds}&part=snippet,statistics`
  );

  const videosData = await videosRes.json();

  return videosData.items;
}

export function extractChannelInfo(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.pathname.startsWith("/channel/")) {
      return {
        type: "id",
        value: parsed.pathname.split("/")[2],
      };
    }

    if (parsed.pathname.startsWith("/@")) {
      return {
        type: "handle",
        value: parsed.pathname.slice(2),
      };
    }

    const parts = parsed.pathname.split("/").filter(Boolean);

    if (parts.length > 0) {
      return {
        type: "custom",
        value: parts[0],
      };
    }

    return null;
  } catch {
    return null;
  }
}