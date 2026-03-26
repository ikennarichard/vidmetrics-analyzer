import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { exportToCSV } from "@/lib/export";
import {
  calculateScore,
  extractChannelInfo,
  fetchChannelVideos,
  getChannelIdFromVideo,
  resolveHandle,
  searchChannelByName,
} from "@/lib/youtube";
import { ChartBar } from "lucide-react";
import { useMemo, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import VideoChart from "./video-chart";
import VideoTable from "./video-table";

export default function ChannelInput() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [videos, setVideos] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<"score" | "views" | "likes">("score");
  const [loading, setLoading] = useState(false);

  const sortVideos = (videos: any[], type: string) => {
    return [...videos].sort((a, b) => {
      if (type === "views") {
        return Number(b.statistics.viewCount) - Number(a.statistics.viewCount);
      }
      if (type === "likes") {
        return Number(b.statistics.likeCount) - Number(a.statistics.likeCount);
      }
      return b.score - a.score;
    });
  };

  const handleAnalyze = async () => {
    const result = extractChannelInfo(url);

    if (!result) {
      setError(
        "Couldn't parse that input — try a channel URL, video URL, or channel name",
      );
      return;
    }

    setError("");
    setLoading(true);

    try {
      let channelId = "";

      if (result.type === "id") {
        channelId = result.value;
      } else if (result.type === "handle" || result.type === "custom") {
        channelId = await resolveHandle(result.value);
      } else if (result.type === "video") {
        channelId = await getChannelIdFromVideo(result.value);
      } else if (result.type === "search") {
        channelId = await searchChannelByName(result.value);
      }

      if (!channelId) {
        setError("Channel not found — try a different URL or name");
        return;
      }

      const videos = await fetchChannelVideos(channelId);

      const enriched = videos.map((v: any) => ({
        ...v,
        score: calculateScore(v),
      }));
      const sorted = sortVideos(enriched, sortBy);
      setVideos(sorted);
    } catch (err) {
      console.error("Failed to fetch videos", err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const sortedVideos = useMemo(() => {
    return sortVideos(videos, sortBy);
  }, [videos, sortBy]);

  return (
    <>
      <Card className="p-6 bg-neutral-900 border-white/10">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-white">
            Channel Analysis
          </h2>
          <p className="text-sm text-neutral-400">
            Paste a Youtube channel URL to see which videos are crushing it
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Channel URL, video URL, or channel name..."
              className="text-white"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            />

            <Button onClick={handleAnalyze} disabled={loading}>
              {loading ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy("score")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              sortBy === "score"
                ? "bg-neutral-100 text-neutral-900 font-medium"
                : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            Score
          </button>

          <button
            onClick={() => setSortBy("views")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              sortBy === "views"
                ? "bg-neutral-100 text-neutral-900 font-medium"
                : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            Views
          </button>

          <button
            onClick={() => setSortBy("likes")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              sortBy === "likes"
                ? "bg-neutral-100 text-neutral-900 font-medium"
                : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            Likes
          </button>
          <button
            onClick={() => exportToCSV(sortedVideos)}
            disabled={videos.length === 0}
            className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ↓ Export CSV
          </button>
        </div>
      </Card>
      {loading && (
        <div className="mt-6 space-y-3">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      )}
      {!loading && videos.length === 0 && (
        <div className="mt-10 flex flex-col items-center justify-center text-center gap-2">
          <p className="text-2xl">
            <ChartBar />
          </p>
          <p className="text-sm font-medium text-neutral-300">No data yet</p>
          <p className="text-xs text-neutral-500">
            Paste a YouTube channel URL above and hit Analyze
          </p>
        </div>
      )}
      <div className="mt-6 space-y-6">
        <VideoChart videos={sortedVideos} title={sortBy} />
        <VideoTable videos={sortedVideos} />
      </div>
    </>
  );
}
