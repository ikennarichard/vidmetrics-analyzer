type Video = {
  id: string;
  snippet: any;
  statistics: any;
  score: number;
};

const format = (num: string) => Intl.NumberFormat().format(Number(num));

export default function VideoTable({ videos }: { videos: Video[] }) {
  if (!videos.length) return null;

  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-neutral-400 border-b border-white/10">
          <tr>
            <th className="py-3">Video</th>
            <th>Views</th>
            <th>Likes</th>
            <th>Comments</th>
            <th>Score</th>
          </tr>
        </thead>

        <tbody>
          {videos.map((video, index) => (
            <tr
              key={video.id}
              className={`border-b border-white/5 hover:bg-white/5 ${
                index === 0 ? "bg-green-500/10" : ""
              }`}
            >
              <td className="py-4 flex items-center gap-4">
                <img
                  src={video.snippet.thumbnails.default.url}
                  alt=""
                  className="w-24 h-14 rounded"
                />
                <span className="font-medium">{video.snippet.title}</span>
                {video.score > 5000 && (
                  <span className="ml-2 text-xs text-green-400">
                    🔥 Crushing it
                  </span>
                )}
              </td>

              <td>{format(video.statistics.viewCount)}</td>
              <td>{video.statistics.likeCount}</td>
              <td>{video.statistics.commentCount}</td>
              <td className="font-semibold">{format(String(video.score))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
