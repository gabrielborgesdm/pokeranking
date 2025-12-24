"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export const EmptyPokemonCard = ({ className }: { className?: string }) => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div
      className={cn(
        "mx-8 mt-16 flex flex-col items-center justify-center py-12",
        className
      )}
    >
      {/* Pokemon silhouette */}
      <div className="relative w-32 h-32 mb-6 opacity-40">
        <Image
          src="/images/who.png"
          alt=""
          fill
          className="object-contain dark:invert"
        />
      </div>

      {/* Text content */}
      <p className="text-lg font-medium text-muted-foreground mb-2">
        {t("rankingView.emptyRanking")}
      </p>

      {/* Decorative pokeball divider */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-muted-foreground/30" />
        <div className="relative w-5 h-5">
          <div className="absolute inset-0 rounded-full bg-muted-foreground/20" />
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted-foreground/40 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-background" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-background border border-muted-foreground/40" />
        </div>
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-muted-foreground/30" />
      </div>

      {/* Go back button */}
      <Button
        variant="outline"
        className="mt-6"
        onClick={() => router.back()}
      >
        <ArrowLeft className="size-4" />
        {t("common.goBack")}
      </Button>
    </div>
  );
}