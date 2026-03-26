# Crushing Videos

A lightweight tool for analyzing YouTube channels.  
Paste a YouTube channel URL and instantly see which videos are "crushing it", with metrics, rankings, and export options.

## Live Demo

Live URL: [https://crushing-videos.vercel.app](https://crushing-videos.vercel.app)

## Features

- Paste a competitor YouTube channel URL
- Fetch latest videos via YouTube Data API
- Display video thumbnails, views, likes, comments
- Automatic performance scoring & ranking
- "🔥 Crushing It" indicators
- Sorting by Score, Views, Likes
- Chart visualization of top-performing videos
- Export video data to CSV
- Responsive design
- Loading skeletons & error handling

## Tech Stack

- **Frontend:** React, Vite, TypeScript
- **Package Manager:** pnpm
- **Styling:** Tailwind CSS + shadcn/ui
- **Charts:** Recharts
- **Data Fetching:** YouTube Data API v3

---

## Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/ikennarichard/crushing-videos.git
cd crushing-videos
```

1. **Install dependencies**

```bash
pnpm install
```

1. **Create environment file**

```bash
cp env.example .env # add your api key in env file
```

2. **Run locally**

```bash
pnpm dev
```

Open `http://localhost:5173` in your browser.

3. **Build for Prodction**

```bash
pnpm build
pnpm preview
```

## Project structure

```bash
src/
  components/
    channel-input.tsx   # Main input + fetch + state
    video-table.tsx     # Table for videos + metrics
    video-chart.tsx     # Top performers chart
  lib/
    youtube.ts          # API calls + parsing + scoring
    export.ts
  main.tsx
  App.tsx              # Layout
```

## Approach

Rapid MVP mindset:

- Start with core functionality, make it work.
- Add polish (charts, sorting, loading states).
- Make it demo-ready.
- Keep scope tight, prioritize reliability over extra features.
