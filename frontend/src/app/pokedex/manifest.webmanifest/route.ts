import { NextResponse } from "next/server";

export async function GET() {
  const manifest = {
    name: "Rankingdex",
    short_name: "Rankingdex",
    description:
      "Pokemon counters, type effectiveness calculator, and complete Pokedex. Works offline!",
    start_url: "/pokedex",
    id: "/pokedex",
    scope: "/pokedex",
    display: "standalone",
    background_color: "#0f1419",
    theme_color: "#ef4444",
    orientation: "any",
    categories: ["entertainment", "games", "education"],
    icons: [
      {
        src: "/favicon-pokedex/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon-pokedex/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/favicon-pokedex/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon-pokedex/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/mobile-rankings.png",
        sizes: "540x1046",
        type: "image/png",
        form_factor: "narrow",
      },
      {
        src: "/screenshots/leaderboard.png",
        sizes: "1212x914",
        type: "image/png",
        form_factor: "wide",
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
