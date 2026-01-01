"use client";

import { memo } from "react";
import { motion, type TargetAndTransition } from "motion/react";

export type GestureType = "tap" | "longPress" | "dragRight" | "dragDown" | "swipeLeft";

interface TutorialHandAnimationProps {
  gesture: GestureType;
  className?: string;
}

const gestureAnimations: Record<GestureType, TargetAndTransition> = {
  tap: {
    scale: [1, 0.85, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatDelay: 0.5,
      ease: "easeInOut",
    },
  },
  longPress: {
    scale: [1, 0.8, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      times: [0, 0.2, 0.8, 1],
      ease: "easeInOut",
    },
  },
  dragRight: {
    x: [0, 50, 50, 0],
    scale: [1, 0.85, 0.85, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      times: [0, 0.1, 0.7, 1],
      ease: "easeInOut",
    },
  },
  dragDown: {
    y: [0, 40, 40, 0],
    scale: [1, 0.85, 0.85, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      times: [0, 0.1, 0.7, 1],
      ease: "easeInOut",
    },
  },
  swipeLeft: {
    x: [30, -30, 30],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const TutorialHandAnimation = memo(function TutorialHandAnimation({
  gesture,
  className,
}: TutorialHandAnimationProps) {
  return (
    <motion.div
      className={className}
      animate={gestureAnimations[gesture]}
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Hand/finger pointing icon */}
        <path
          d="M12 2C10.9 2 10 2.9 10 4V11.17L8.41 9.59C7.63 8.81 6.36 8.81 5.59 9.59C4.81 10.36 4.81 11.63 5.59 12.41L10.59 17.41C11.37 18.19 12.63 18.19 13.41 17.41L18.41 12.41C19.19 11.63 19.19 10.36 18.41 9.59C17.63 8.81 16.36 8.81 15.59 9.59L14 11.17V4C14 2.9 13.1 2 12 2Z"
          fill="currentColor"
          className="text-primary"
        />
        {/* Finger/pointer shape */}
        <circle
          cx="12"
          cy="8"
          r="6"
          fill="currentColor"
          className="text-primary/90"
        />
        <circle
          cx="12"
          cy="8"
          r="4"
          fill="currentColor"
          className="text-primary-foreground/30"
        />
      </svg>
    </motion.div>
  );
});
