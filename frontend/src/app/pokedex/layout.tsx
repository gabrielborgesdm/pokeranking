import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pokedex",
  description:
    "Browse all Pokemon, explore type effectiveness, and discover Pokemon stats",
  manifest: "/pokedex/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pokedex",
  },
};

export default function PokedexLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
