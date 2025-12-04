"use client";

import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function getPageNumbers(
  currentPage: number,
  totalPages: number
): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [
      1,
      "ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ];
}

export const Pagination = memo(function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const { t } = useTranslation();

  const pageNumbers = useMemo(
    () => getPageNumbers(currentPage, totalPages),
    [currentPage, totalPages]
  );

  if (totalPages <= 1) return null;

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label={t("pagination.previous")}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="icon"
              onClick={() => onPageChange(page)}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </Button>
          )
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label={t("pagination.next")}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <span className="ml-2 text-sm text-muted-foreground">
        {t("pagination.page", { current: currentPage, total: totalPages })}
      </span>
    </div>
  );
});

export function PaginationSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      <Skeleton className="h-9 w-9" />
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-9" />
        ))}
      </div>
      <Skeleton className="h-9 w-9" />
      <Skeleton className="ml-2 h-5 w-32" />
    </div>
  );
}

interface SimplePaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const SimplePagination = memo(function SimplePagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  className,
}: SimplePaginationProps) {
  const { t } = useTranslation();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <p className="text-sm text-muted-foreground text-center sm:text-left">
        {t("pagination.showing", {
          from: (page - 1) * limit + 1,
          to: Math.min(page * limit, total),
          total,
        })}
      </p>
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{t("pagination.previous")}</span>
        </Button>
        <span className="text-sm whitespace-nowrap">
          {t("pagination.page", { current: page, total: totalPages })}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          <span className="hidden sm:inline">{t("pagination.next")}</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

export function SimplePaginationSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <Skeleton className="h-5 w-40 mx-auto sm:mx-0" />
      <div className="flex items-center justify-center gap-2">
        <Skeleton className="h-8 w-8 sm:w-24" />
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-8 w-8 sm:w-20" />
      </div>
    </div>
  );
}
