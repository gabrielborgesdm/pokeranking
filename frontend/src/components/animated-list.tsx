"use client";

import { Children, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";

interface AnimatedListProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function AnimatedList({
  children,
  staggerDelay = 0.05,
  className,
}: AnimatedListProps) {
  return (
    <AnimatePresence mode="wait">
      <div className={className}>
        {Children.map(children, (child, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              duration: 0.3,
              delay: index * staggerDelay,
              ease: "easeOut",
            }}
          >
            {child}
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
}
