export default function Header() {
  return (
    <header className="w-full border-b border-white/10 bg-neutral-950/80 backdrop-blur-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        <span className="flex items-center justify-center w-7 h-7 rounded-md bg-green-500/15 border border-green-500/20 text-sm">
          🔥
        </span>
        Crushing Videos
        <span className="text-[11px] text-neutral-500 font-normal">
          by Vidmetrics
        </span>
      </h1>
      <span className="text-[11px] text-neutral-500 bg-neutral-800 border border-white/5 px-2.5 py-1 rounded-full">
        YouTube Data API v3
      </span>
    </header>
  );
}
