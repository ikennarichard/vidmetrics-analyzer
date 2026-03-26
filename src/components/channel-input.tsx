import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { exportToCSV } from "@/lib/export";
import {
  calculateScore,
  extractChannelInfo,
  fetchChannelVideos,
} from "@/lib/youtube";
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

    if (!result || result.type !== "id") {
      setError("Please use a /channel/ URL for now");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const videos = await fetchChannelVideos(result.value);

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
          <h2 className="text-lg font-medium text-white">
            Analyze Youtube Channel
          </h2>
          <p className="text-sm text-neutral-400">
            Discover which videos are performing best
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Paste youtube channel url..."
              className="text-white"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button onClick={handleAnalyze} disabled={loading}>
              {loading ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy("score")}
            className={`px-3 py-1 text-sm rounded ${
              sortBy === "score" ? "bg-white text-black" : "bg-white/10"
            }`}
          >
            Score
          </button>

          <button
            onClick={() => setSortBy("views")}
            className={`px-3 py-1 text-sm rounded ${
              sortBy === "views" ? "bg-white text-black" : "bg-white/10"
            }`}
          >
            Views
          </button>

          <button
            onClick={() => setSortBy("likes")}
            className={`px-3 py-1 text-sm rounded ${
              sortBy === "likes" ? "bg-white text-black" : "bg-white/10"
            }`}
          >
            Likes
          </button>
          <button
            onClick={() => exportToCSV(videos)}
            disabled={videos.length === 0}
            className="text-white mr-2 disabled:opacity-50 cursor-none pointer-events-none"
          >
            Export CSV
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
        <p className="mt-6 text-sm text-neutral-400">
          Paste a YouTube channel URL to analyze performance.
        </p>
      )}
      <div className="mt-6 space-y-6">
        <VideoChart videos={sortedVideos} title={sortBy} />
        <VideoTable videos={sortedVideos} />
      </div>
    </>
  );
}
