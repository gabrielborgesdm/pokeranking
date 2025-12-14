import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/providers";
import { Toaster } from "@/components/ui/sonner";
import { ConditionalNavbar } from "@/components/conditional-navbar";
import { GoogleAnalytics } from "@/components/google-analytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Pokeranking - Rank your Pokemon",
    template: "%s | Pokeranking",
  },
  description:
    "Create and share personalized Pokemon tier lists. Rank your favorite Pokemon, build collections, and join the community.",
  keywords: [
    "Pokemon",
    "tier list",
    "ranking",
    "Pokemon ranking",
    "tier maker",
    "Pokemon collection",
  ],
  authors: [{ name: "Gabriel Borges", url: "https://github.com/gabrielborgesdm" }],
  creator: "Gabriel Borges",
  icons: {
    icon: "/ico.png",
    shortcut: "/ico.png",
    apple: "/ico.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Pokeranking",
    title: "Pokeranking - Rank your Pokemon",
    description:
      "Create and share personalized Pokemon tier lists. Rank your favorite Pokemon, build collections, and join the community.",
    images: [
      {
        url: "/screenshots/leaderboard.png",
        width: 1200,
        height: 630,
        alt: "Pokeranking Leaderboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pokeranking - Rank your Pokemon",
    description:
      "Create and share personalized Pokemon tier lists. Rank your favorite Pokemon, build collections, and join the community.",
    images: ["/screenshots/leaderboard.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.cdnfonts.com/css/pokemon-solid"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <ConditionalNavbar />
          {children}
        </Providers>
        <Toaster richColors position="top-right" />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
