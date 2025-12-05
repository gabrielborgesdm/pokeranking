"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useRankingsControllerFindOne } from "@pokeranking/api-client";
import { Skeleton } from "@/components/ui/skeleton";

interface RankingPageProps {
  params: Promise<{ id: string }>;
}

export default function RankingPage({ params }: RankingPageProps) {
  const { id } = use(params);

  const { data, isLoading, error } = useRankingsControllerFindOne(id);

  if (error || (data && data.status === 404)) {
    notFound();
  }

  const ranking = data?.data;

  return (
    <main className="container mx-auto px-4 py-8">
      {isLoading || !ranking ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">{ranking.title}</h1>
            {ranking.user && (
              <p className="text-muted-foreground">by {ranking.user.username}</p>
            )}
          </div>

          {/* TODO: Display ranking content */}
          <pre className="text-sm text-muted-foreground">
            {JSON.stringify(ranking, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}
