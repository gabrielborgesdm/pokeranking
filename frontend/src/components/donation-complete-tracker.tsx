"use client";

import { useEffect } from "react";
import { useAnalytics } from "@/hooks/use-analytics";

export function DonationCompleteTracker() {
  const { trackDonationComplete } = useAnalytics();

  useEffect(() => {
    trackDonationComplete("stripe");
  }, [trackDonationComplete]);

  return null;
}
