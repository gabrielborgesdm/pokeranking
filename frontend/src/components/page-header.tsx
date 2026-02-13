"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { t } from "i18next";

interface PageHeaderProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  backHref?: string;
  backLabel?: string;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  backHref,
  backLabel,
  className,
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className={cn("space-y-4", className)}>
      {backLabel && (
        <Button
          variant="ghost"
          size="sm"
          asChild={!!backHref}
          onClick={!backHref ? () => router.back() : undefined}
        >
          {backHref ? (
            <Link href={backHref}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {backLabel || t("common.back")}
            </Link>
          ) : (
            <>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {backLabel || t("common.back")}
            </>
          )}
        </Button>
      )}
      <div
        className={cn(
          "flex flex-col gap-4",
          action && "sm:flex-row sm:items-center sm:justify-between"
        )}
      >
        <div className="space-y-1">
          {title && <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>}
          {description && (
            <p className="text-sm sm:text-base text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

export function PageHeaderSkeleton({
  hasAction = false,
  hasBack = false,
  className,
}: {
  hasAction?: boolean;
  hasBack?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {hasBack && <Skeleton className="h-8 w-32" />}
      <div
        className={cn(
          "flex flex-col gap-4",
          hasAction && "sm:flex-row sm:items-center sm:justify-between"
        )}
      >
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 sm:h-9 sm:w-64" />
          <Skeleton className="h-4 w-32 sm:h-5 sm:w-48" />
        </div>
        {hasAction && <Skeleton className="h-9 w-32" />}
      </div>
    </div>
  );
}
