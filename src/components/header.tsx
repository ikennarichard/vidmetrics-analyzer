import { Flame } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full border-b border-white/10 bg-neutral-950/80 backdrop-blur-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <h1 className="flex gap-2 text-lg font-semibold tracking-tight items-baseline">
        <span className="flex items-center justify-center w-7 h-7 rounded-md bg-green-500/15 border border-green-500/20 text-sm">
          <Flame size={18} color="orange" fill="orange"/>
        </span>
       Vidmetrics
      </h1>
      <span className="text-[11px] text-neutral-500 bg-neutral-800 border border-white/5 px-2.5 py-1 rounded-full">
        YouTube Data API v3
      </span>
    </header>
  );
}
