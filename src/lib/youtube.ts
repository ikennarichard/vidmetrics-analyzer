export function extractChannelInfo(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.pathname.startsWith("/channel/")) {
      return {
        type: "id",
        value: parsed.pathname.split("/")[2],
      };
    }

    if (parsed.pathname.startsWith("/@")) {
      return {
        type: "handle",
        value: parsed.pathname.slice(2),
      };
    }

    const parts = parsed.pathname.split("/").filter(Boolean);

    if (parts.length > 0) {
      return {
        type: "custom",
        value: parts[0],
      };
    }

    return null;
  } catch {
    return null;
  }
}