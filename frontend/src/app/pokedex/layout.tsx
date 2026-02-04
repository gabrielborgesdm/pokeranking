import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rankingdex",
  description:
    "Pokemon counters, type effectiveness calculator, and complete Pokedex. Works offline!",
  manifest: "/pokedex/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Rankingdex",
  },
};

export default function PokedexLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
