import type { Metadata } from "next";
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const ua = headersList.get("user-agent") || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua);

  return {
    title: "Pokedex",
    description:
      "Pokemon counters, type effectiveness calculator, and complete Pokedex. Works offline!",
    ...(isIOS
      ? {}
      : {
          manifest: "/pokedex/manifest.webmanifest",
          appleWebApp: {
            capable: true,
            statusBarStyle: "default",
            title: "Pokedex",
          },
        }),
  };
}

export default function PokedexLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
