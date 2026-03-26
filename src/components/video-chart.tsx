import {
  Bar,
  BarChart,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function VideoChart({
  videos,
  title,
}: {
  videos: any[];
  title: string;
}) {
  if (!videos.length) return null;

  const data = videos.slice(0, 5).map((v) => ({
    name: v.snippet.title.slice(0, 14),
    views: Number(v.statistics.viewCount),
    score: v.score,
  }));

  return (
    <div className="mt-8 bg-neutral-900 p-5 rounded-xl border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-white">
          Top Performing Videos
        </h3>
        <span className="text-xs text-neutral-400 bg-neutral-800 px-2 py-1 rounded-md">
          Top 5
        </span>
      </div>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              tick={{ fill: "#737373", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={0}
              height={48}
              tickFormatter={(value) =>
                value.length > 12 ? value.slice(0, 12) + "…" : value
              }
            />
            <YAxis
              tick={{ fill: "#737373", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
              }
            />
            <Tooltip
              cursor={false}
              contentStyle={{
                backgroundColor: "#171717",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#fff",
              }}
              itemStyle={{ color: "#fff" }}
              labelStyle={{ color: "#a3a3a3" }}
              formatter={(value) => [`${value?.toLocaleString()}`, title]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.name ?? ""}
            />
            <Bar
              dataKey="score"
              fill="#404040"
              radius={[6, 6, 0, 0]}
              activeBar={
                <Rectangle fill="#22c55e" stroke="#16a34a" strokeWidth={1} />
              }
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
