import ChannelInput from "@/components/channel-input";
import { type SavedChannel } from "@/lib/storage";
import { useState } from "react";
import Header from "./components/header";
import SavedChannels from "./components/saved-channels";

export default function App() {
  const [sidebarKey, setSidebarKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<{
    channel: SavedChannel;
    ts: number;
  } | null>(null);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Header />

      <div className="flex max-w-7xl mx-auto px-4 sm:px-6 py-10 gap-6">
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="md:hidden fixed bottom-5 right-5 z-50 bg-neutral-800 border border-white/10 text-white text-xs px-4 py-2 rounded-full shadow-lg"
        >
          {sidebarOpen ? "✕ Close" : "📋 Saved"}
        </button>

        <aside
          className={`
      fixed inset-y-0 left-0 z-40 w-64 bg-neutral-950 border-r border-white/10 px-4 py-6 transition-transform duration-200
      md:static md:translate-x-0 md:border-none md:bg-transparent md:px-0 md:py-0 md:w-64 md:shrink-0
      ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
    `}
        >
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
            Saved Channels
          </p>
          <SavedChannels
            onSelect={(ch) => {
              setSelectedChannel({ channel: ch, ts: Date.now() });
              setSidebarOpen(false);
            }}
            refreshKey={sidebarKey}
          />
        </aside>

        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
          />
        )}

        {/* main content — full width on mobile */}
        <main className="flex-1 min-w-0 w-full">
          <ChannelInput
            preloadChannel={selectedChannel}
            onSave={() => setSidebarKey((k) => k + 1)}
          />
        </main>
      </div>
    </div>
  );
}
