import {
  Bar,
  BarChart,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function VideoChart({ videos, title }: { videos: any[], title: string }) {
  if (!videos.length) return null;

  const data = videos.slice(0, 5).map((v) => ({
    name: v.snippet.title.slice(0, 20) + "...",
    views: Number(v.statistics.viewCount),
    score: v.score,
  }));

  return (
    <div className="mt-8 h-80 bg-neutral-900 p-4 rounded-xl border border-white/10">
      <h3 className="text-sm text-neutral-400 mb-4">Top Performing Videos</h3>

      <ResponsiveContainer width="90%" height="90%">
        <BarChart data={data}>
          <XAxis dataKey="name" hide />
          <YAxis />
          <Tooltip
            cursor={false}
            formatter={(value) => {
              return [`${value?.toLocaleString()}`, title];
            }}
          />
          <Bar
            dataKey="score"
            fill="#888"
            radius={[10, 10, 0, 0]}
            activeBar={<Rectangle fill="#38f376" />}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
