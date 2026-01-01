"use client";

import { memo } from "react";
import { motion } from "motion/react";
import { TutorialHandAnimation, type GestureType } from "./tutorial-hand-animation";

interface IllustrationProps {
  className?: string;
}

/**
 * Step 1: Tab Navigation - Shows two tabs with highlight
 */
export const TabsIllustration = memo(function TabsIllustration({
  className,
}: IllustrationProps) {
  return (
    <div className={className}>
      <div className="relative flex flex-col items-center">
        {/* Tab bar mockup */}
        <div className="flex gap-2 bg-muted/50 rounded-lg p-1.5">
          <motion.div
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Ranking
          </motion.div>
          <motion.div
            className="px-4 py-2 rounded-md bg-muted text-muted-foreground text-xs font-medium"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          >
            Box
          </motion.div>
        </div>
        {/* Hand animation */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
          <TutorialHandAnimation gesture="tap" />
        </div>
      </div>
    </div>
  );
});

/**
 * Step 2: Drag from Box - Shows Pokemon card being dragged
 */
export const DragFromBoxIllustration = memo(function DragFromBoxIllustration({
  className,
}: IllustrationProps) {
  return (
    <div className={className}>
      <div className="relative flex items-center justify-center">
        {/* Pokemon card mockup */}
        <motion.div
          className="w-16 h-20 bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg border-2 border-primary/50 flex items-center justify-center shadow-lg"
          animate={{
            x: [0, 40, 40, 0],
            y: [0, -20, -20, 0],
            scale: [1, 1.1, 1.1, 1],
            rotate: [0, 5, 5, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            times: [0, 0.2, 0.7, 1],
          }}
        >
          <div className="w-10 h-10 rounded-full bg-primary/30" />
        </motion.div>
        {/* Hand following the card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-2">
          <TutorialHandAnimation gesture="dragRight" />
        </div>
      </div>
    </div>
  );
});

/**
 * Step 3: Auto-switch - Shows arrow between tabs
 */
export const AutoSwitchIllustration = memo(function AutoSwitchIllustration({
  className,
}: IllustrationProps) {
  return (
    <div className={className}>
      <div className="relative flex flex-col items-center gap-4">
        {/* Tab bar with arrow */}
        <div className="flex items-center gap-4">
          <div className="px-3 py-1.5 rounded-md bg-muted text-muted-foreground text-xs">
            Box
          </div>
          <motion.div
            className="text-primary"
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </motion.div>
          <motion.div
            className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
          >
            Ranking
          </motion.div>
        </div>
        {/* Card being dragged */}
        <motion.div
          className="w-12 h-14 bg-primary/20 rounded-lg border border-primary/50"
          animate={{ x: [-20, 20, -20], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </div>
  );
});

/**
 * Step 4: Reorder - Shows cards being reordered vertically
 */
export const ReorderIllustration = memo(function ReorderIllustration({
  className,
}: IllustrationProps) {
  return (
    <div className={className}>
      <div className="relative flex flex-col items-center gap-2">
        {/* Stack of cards */}
        <div className="flex flex-col gap-1.5">
          <div className="w-14 h-8 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
            #1
          </div>
          <motion.div
            className="w-14 h-8 bg-primary/30 rounded-md border-2 border-primary flex items-center justify-center text-xs text-primary font-medium shadow-lg"
            animate={{
              y: [0, -28, -28, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              times: [0, 0.3, 0.7, 1],
            }}
          >
            #2
          </motion.div>
          <div className="w-14 h-8 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
            #3
          </div>
        </div>
        {/* Hand */}
        <div className="absolute top-1/2 right-0 translate-x-8">
          <TutorialHandAnimation gesture="dragDown" />
        </div>
      </div>
    </div>
  );
});

/**
 * Step 5: Remove - Shows X button highlight
 */
export const RemoveIllustration = memo(function RemoveIllustration({
  className,
}: IllustrationProps) {
  return (
    <div className={className}>
      <div className="relative flex items-center justify-center">
        {/* Card with X button */}
        <div className="relative w-16 h-20 bg-muted/50 rounded-lg border border-border">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-muted" />
          </div>
          {/* X button */}
          <motion.div
            className="absolute -top-2 -right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center shadow-lg"
            animate={{
              scale: [1, 1.2, 1],
              boxShadow: [
                "0 0 0 0 rgba(239, 68, 68, 0)",
                "0 0 0 8px rgba(239, 68, 68, 0.3)",
                "0 0 0 0 rgba(239, 68, 68, 0)",
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </motion.div>
        </div>
        {/* Hand */}
        <div className="absolute -top-2 right-0 translate-x-6">
          <TutorialHandAnimation gesture="tap" />
        </div>
      </div>
    </div>
  );
});

export type TutorialStep = 1 | 2 | 3 | 4 | 5;

interface TutorialIllustrationProps {
  step: TutorialStep;
  className?: string;
}

export const TutorialIllustration = memo(function TutorialIllustration({
  step,
  className,
}: TutorialIllustrationProps) {
  switch (step) {
    case 1:
      return <TabsIllustration className={className} />;
    case 2:
      return <DragFromBoxIllustration className={className} />;
    case 3:
      return <AutoSwitchIllustration className={className} />;
    case 4:
      return <ReorderIllustration className={className} />;
    case 5:
      return <RemoveIllustration className={className} />;
  }
});
