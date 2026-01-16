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
  totalPages: number,
  maxVisible: number = 7
): (number | "ellipsis")[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // For smaller maxVisible (mobile), show fewer surrounding pages
  const sidePages = maxVisible <= 5 ? 1 : 2;
  const edgeThreshold = sidePages + 2;

  if (currentPage <= edgeThreshold) {
    const visibleStart = Array.from(
      { length: edgeThreshold + sidePages },
      (_, i) => i + 1
    );
    return [...visibleStart, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - edgeThreshold + 1) {
    const visibleEnd = Array.from(
      { length: edgeThreshold + sidePages },
      (_, i) => totalPages - edgeThreshold - sidePages + 1 + i
    );
    return [1, "ellipsis", ...visibleEnd];
  }

  const middle = Array.from(
    { length: sidePages * 2 + 1 },
    (_, i) => currentPage - sidePages + i
  );
  return [1, "ellipsis", ...middle, "ellipsis", totalPages];
}

export const Pagination = memo(function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const { t } = useTranslation();

  // Mobile: show 5 pages max, Desktop: show 7 pages max
  const mobilePageNumbers = useMemo(
    () => getPageNumbers(currentPage, totalPages, 5),
    [currentPage, totalPages]
  );

  const desktopPageNumbers = useMemo(
    () => getPageNumbers(currentPage, totalPages, 7),
    [currentPage, totalPages]
  );

  if (totalPages <= 1) return null;

  const renderPageButtons = (
    pageNumbers: (number | "ellipsis")[],
    keyPrefix: string
  ) =>
    pageNumbers.map((page, index) =>
      page === "ellipsis" ? (
        <span
          key={`${keyPrefix}-ellipsis-${index}`}
          className="px-1 sm:px-2 text-muted-foreground"
        >
          ...
        </span>
      ) : (
        <Button
          key={`${keyPrefix}-${page}`}
          variant={page === currentPage ? "default" : "outline"}
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9"
          onClick={() => onPageChange(page)}
          aria-label={`Page ${page}`}
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page}
        </Button>
      )
    );

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-1",
        className
      )}
    >
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 sm:h-9 sm:w-9"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label={t("pagination.previous")}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Mobile view */}
      <div className="flex items-center gap-1 sm:hidden">
        {renderPageButtons(mobilePageNumbers, "mobile")}
      </div>

      {/* Desktop view */}
      <div className="hidden sm:flex items-center gap-1">
        {renderPageButtons(desktopPageNumbers, "desktop")}
      </div>

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 sm:h-9 sm:w-9"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label={t("pagination.next")}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <span className="hidden xs:inline ml-2 text-sm text-muted-foreground">
        {t("pagination.page", { current: currentPage, total: totalPages })}
      </span>
    </div>
  );
});

export function PaginationSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-1",
        className
      )}
    >
      <Skeleton className="h-8 w-8 sm:h-9 sm:w-9" />
      {/* Mobile: 5 buttons, Desktop: 7 buttons */}
      <div className="flex items-center gap-1 sm:hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-8" />
        ))}
      </div>
      <div className="hidden sm:flex items-center gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-9" />
        ))}
      </div>
      <Skeleton className="h-8 w-8 sm:h-9 sm:w-9" />
      <Skeleton className="hidden xs:block ml-2 h-5 w-32" />
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
