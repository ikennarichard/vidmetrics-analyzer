import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { exportToCSV } from "@/lib/export";
import {
  saveChannel,
  updateLastAnalyzed,
  type SavedChannel,
} from "@/lib/storage";
import {
  calculateScore,
  extractChannelInfo,
  fetchChannelInfo,
  fetchChannelVideos,
  getChannelIdFromVideo,
  resolveCustomUrl,
  resolveHandle,
  searchChannelByName,
} from "@/lib/youtube";
import { ChartBar } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import VideoChart from "./video-chart";
import VideoTable from "./video-table";

export default function ChannelInput({
  preloadChannel,
  onSave
}: {
  preloadChannel: { channel: SavedChannel; ts: number } | null;
  onSave: () => void
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [videos, setVideos] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<"score" | "views" | "likes">("score");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [channelMeta, setChannelMeta] = useState<{
    id: string;
    name: string;
    thumbnail: string;
  } | null>(null);
  const [saved, setSaved] = useState(false);

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

  const handleAnalyze = useCallback(
    async (preloadId?: string) => {
      if (!url.trim() && !preloadId) {
        setError("Please enter a channel URL or name");
        return;
      }

      setError("");
      setLoading(true);
      setLoadingStep("Resolving channel...");

      try {
        let channelId = "";

        if (preloadId) {
          channelId = preloadId;
        } else {
          const result = extractChannelInfo(url);

          if (!result) {
            setError(
              "Couldn't parse that input — try a channel URL, video URL, or channel name",
            );
            return;
          }

          if (result.type === "id") {
            channelId = result.value;
          } else if (result.type === "handle") {
            channelId = await resolveHandle(result.value);
          } else if (result.type === "custom") {
            channelId = await resolveCustomUrl(result.value);
          } else if (result.type === "video") {
            channelId = await getChannelIdFromVideo(result.value);
          } else if (result.type === "search") {
            channelId = await searchChannelByName(result.value);
          }
        }

        if (!channelId) {
          setError("Channel not found — try a different URL or name");
          return;
        }

        setLoadingStep("Fetching channel info...");
        const meta = await fetchChannelInfo(channelId);
        setChannelMeta(meta);
        setSaved(false);

        setLoadingStep("Fetching videos...");
        const rawVideos = await fetchChannelVideos(channelId);

        setLoadingStep("Calculating scores...");
        const enriched = rawVideos.map((v: any) => ({
          ...v,
          score: calculateScore(v),
        }));

        setVideos(sortVideos(enriched, sortBy));
        if (channelMeta) {
          updateLastAnalyzed(channelMeta.id);
        }
        setSortBy("score");
      } catch (err) {
        console.error("Failed to fetch videos", err);
        setError("Something went wrong — check the URL and try again");
      } finally {
        setLoading(false);
        setLoadingStep("");
      }
    },
    [url, sortBy],
  );

  const sortedVideos = useMemo(() => {
    return sortVideos(videos, sortBy);
  }, [videos, sortBy]);

  useEffect(() => {
    if (preloadChannel) {
      setUrl(preloadChannel.channel.url);
      handleAnalyze(preloadChannel.channel.id);
    }
  }, [preloadChannel]);

  return (
    <>
      <Card className="p-6 bg-neutral-900 border-white/10">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-white">Channel Analysis</h2>
          <p className="text-sm text-neutral-400">
            Paste a Youtube channel to see which videos are crushing it
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Channel URL, video URL, or channel name..."
              className="text-white"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            />

            <Button onClick={() => handleAnalyze()} disabled={loading}>
              {loading ? loadingStep : "Analyze"}
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
        {!loading && videos.length > 0 && (
          <div className="mt-6 space-y-6">
            {/* channel identity + save */}
            {channelMeta && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={channelMeta.thumbnail}
                    className="w-8 h-8 rounded-full"
                    alt=""
                  />
                  <p className="text-sm font-medium text-white">
                    {channelMeta.name}
                  </p>
                </div>

                <button
                  onClick={() => {
                    saveChannel({
                      id: channelMeta.id,
                      name: channelMeta.name,
                      url: url,
                      thumbnail: channelMeta.thumbnail,
                      lastAnalyzed: new Date().toISOString(),
                    });
                    setSaved(true);
                    onSave();
                  }}
                  className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                    saved
                      ? "border-green-500/30 text-green-400 bg-green-500/10"
                      : "border-white/10 text-neutral-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  {saved ? "✓ Saved" : "+ Save Channel"}
                </button>
              </div>
            )}

            <VideoChart videos={sortedVideos} />
            <VideoTable videos={sortedVideos} />
          </div>
        )}
      </div>
    </>
  );
}
