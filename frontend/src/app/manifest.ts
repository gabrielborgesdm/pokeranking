import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pokeranking - Create & Share Pokemon rankings",
    short_name: "Pokeranking",
    description:
      "Create and share personalized Pokemon rankings. Rank your favorite Pokemon, build collections, and join the community.",
    start_url: "/",
    id: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0f1419",
    theme_color: "#4476da",
    orientation: "any",
    categories: ["entertainment", "games", "lifestyle"],
    icons: [
      {
        src: "/favicon/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/favicon/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "All Rankings",
        short_name: "Rankings",
        description: "Browse all Pokemon rankings",
        url: "/rankings",
        icons: [
          {
            src: "/favicon/web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "Pokedex",
        short_name: "Pokedex",
        description: "Browse all Pokemon in the Pokedex",
        url: "/pokedex",
        icons: [
          {
            src: "/favicon/web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
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
}
