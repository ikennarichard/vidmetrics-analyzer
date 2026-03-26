import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { extractChannelInfo } from "@/lib/youtube";
import { useState } from "react";

export default function ChannelInput() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleAnalyze = () => {
    const result = extractChannelInfo(url);

    if (!result) {
      setError("Invalid YouTube channel URL");
      console.error("Invalid URL");
      return;
    }
    setError("");
    // console.log("Parsed channel:", result);
  };

  return (
    <Card className="p-6 bg-neutral-900 border-white/10">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-medium text-white">Analyze Competitor Channel</h2>

        <div className="flex gap-2">
          <Input
            placeholder="Paste YouTube channel URL..."
            className="text-white"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button onClick={handleAnalyze}>Analyze</Button>
        </div>
      </div>
    </Card>
  );
}
