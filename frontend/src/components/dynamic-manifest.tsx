"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function DynamicManifest() {
  const pathname = usePathname();

  useEffect(() => {
    const isPokedex = pathname?.startsWith("/pokedex");

    // Update manifest link
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      manifestLink.setAttribute(
        "href",
        isPokedex ? "/pokedex/manifest.webmanifest" : "/manifest.webmanifest"
      );
    }

    // Update iOS app title
    let appleTitleMeta = document.querySelector(
      'meta[name="apple-mobile-web-app-title"]'
    );
    if (!appleTitleMeta) {
      appleTitleMeta = document.createElement("meta");
      appleTitleMeta.setAttribute("name", "apple-mobile-web-app-title");
      document.head.appendChild(appleTitleMeta);
    }
    appleTitleMeta.setAttribute(
      "content",
      isPokedex ? "Pokedex" : "Pokeranking"
    );
  }, [pathname]);

  return null;
}
