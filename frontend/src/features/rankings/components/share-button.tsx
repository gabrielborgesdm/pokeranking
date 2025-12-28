"use client";

import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Share2, Link, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

interface ShareButtonProps {
  rankingId: string;
  rankingTitle: string;
}

const XIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
  </svg>
);

export const ShareButton = memo(function ShareButton({
  rankingId,
  rankingTitle,
}: ShareButtonProps) {
  const { t } = useTranslation();

  const getShareUrl = useCallback(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/rankings/${rankingId}`;
  }, [rankingId]);

  const handleCopyUrl = useCallback(async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("rankingView.urlCopied"));
    } catch {
      toast.error(t("common.error"));
    }
  }, [getShareUrl, t]);

  const handleShareTwitter = useCallback(() => {
    const url = getShareUrl();
    const text = encodeURIComponent(
      t("rankingView.shareMessageTwitter", { title: rankingTitle })
    );
    const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }, [getShareUrl, rankingTitle, t]);

  const handleShareFacebook = useCallback(() => {
    const url = getShareUrl();
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }, [getShareUrl]);

  const handleShareWhatsapp = useCallback(() => {
    const url = getShareUrl();
    const message = t("rankingView.shareMessageWhatsapp", { title: rankingTitle });
    const text = encodeURIComponent(`${message}\n\n${url}`);
    const shareUrl = `https://wa.me/?text=${text}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }, [getShareUrl, rankingTitle, t]);

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Share2 className="h-4 w-4" />
              <span className="sr-only">{t("rankingView.share")}</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{t("rankingView.share")}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopyUrl}>
          <Link className="h-4 w-4" />
          {t("rankingView.copyUrl")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareTwitter}>
          <XIcon className="h-4 w-4" />
          {t("rankingView.shareTwitter")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareFacebook}>
          <FacebookIcon className="h-4 w-4" />
          {t("rankingView.shareFacebook")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareWhatsapp}>
          <MessageCircle className="h-4 w-4" />
          {t("rankingView.shareWhatsapp")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
