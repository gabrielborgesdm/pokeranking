import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/providers";
import { Toaster } from "@/components/ui/sonner";
import { ConditionalNavbar } from "@/components/conditional-navbar";
import { GoogleAnalytics } from "@/components/google-analytics";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://pokeranking.com.br"),
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
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pokeranking",
  },
  icons: {
    icon: [
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon/web-app-manifest-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon/favicon.ico",
    apple: [
      { url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  formatDetection: {
    telephone: false,
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
        <meta name="theme-color" content="#4476da" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#5e8fe3" media="(prefers-color-scheme: dark)" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://ik.imagekit.io" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ServiceWorkerRegister />
        <Providers>
          <ConditionalNavbar />
          {children}
          <GoogleAnalytics />
          <PWAInstallPrompt />
        </Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
