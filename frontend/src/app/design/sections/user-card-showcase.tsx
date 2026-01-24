"use client";

import { useTranslation } from "react-i18next";
import { UserCard, PokemonTypeVariant } from "@/features/users";

const mockUsers: {
  rank: number;
  username: string;
  avatarUrl: string;
  totalScore: number;
  variant: PokemonTypeVariant;
}[] = [
    {
      rank: 1,
      username: "GrassTrainer",
      avatarUrl: "/pokemon/Floragato.png",
      totalScore: 15420,
      variant: "grass",
    },
    {
      rank: 2,
      username: "AquaMaster",
      avatarUrl: "/pokemon/basculegion.png",
      totalScore: 14850,
      variant: "water",
    },
    {
      rank: 3,
      username: "FlameChampion",
      avatarUrl: "/pokemon/fuecoco.png",
      totalScore: 13200,
      variant: "fire",
    },
    {
      rank: 4,
      username: "ThunderBolt",
      avatarUrl: "/pokemon/Bellibolt.png",
      totalScore: 12890,
      variant: "electric",
    },
    {
      rank: 5,
      username: "SpecialOps",
      avatarUrl: "/pokemon/Flutter_Mane.png",
      totalScore: 11750,
      variant: "special",
    },
  ];

export function UserCardShowcase() {
  const { t } = useTranslation();

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {t("design.sections.userCards.title")}
        </h2>
        <p className="text-muted-foreground">
          {t("design.sections.userCards.description")}
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockUsers.map((user) => (
          <UserCard
            key={user.rank}
            rank={user.rank}
            username={user.username}
            avatarUrl={user.avatarUrl}
            totalScore={user.totalScore}
            variant={user.variant}
          />
        ))}
      </div>
    </section>
  );
}
