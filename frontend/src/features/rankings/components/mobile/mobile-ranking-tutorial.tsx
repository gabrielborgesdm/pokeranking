"use client";

import { memo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TutorialIllustration, type TutorialStep } from "./tutorial-illustrations";

const TOTAL_STEPS = 5;

interface MobileRankingTutorialProps {
  isOpen: boolean;
  onComplete: () => void;
}

interface StepContent {
  titleKey: string;
  descKey: string;
}

const stepContents: Record<TutorialStep, StepContent> = {
  1: { titleKey: "step1Title", descKey: "step1Desc" },
  2: { titleKey: "step2Title", descKey: "step2Desc" },
  3: { titleKey: "step3Title", descKey: "step3Desc" },
  4: { titleKey: "step4Title", descKey: "step4Desc" },
  5: { titleKey: "step5Title", descKey: "step5Desc" },
};

export const MobileRankingTutorial = memo(function MobileRankingTutorial({
  isOpen,
  onComplete,
}: MobileRankingTutorialProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<TutorialStep>(1);
  const [direction, setDirection] = useState(0);

  const handleNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS) {
      setDirection(1);
      setCurrentStep((prev) => (prev + 1) as TutorialStep);
    } else {
      onComplete();
    }
  }, [currentStep, onComplete]);

  const handleSkip = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const handleDotClick = useCallback((step: TutorialStep) => {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
  }, [currentStep]);

  const isLastStep = currentStep === TOTAL_STEPS;
  const stepContent = stepContents[currentStep];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Tutorial card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative z-10 w-[calc(100%-2rem)] max-w-sm bg-card rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center">
          <h2 className="text-lg font-semibold text-foreground">
            {t("mobileRankingTutorial.title")}
          </h2>
        </div>

        {/* Illustration area */}
        <div className="relative h-40 flex items-center justify-center bg-muted/30 mx-4 rounded-xl overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              initial={{ opacity: 0, x: direction * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 50 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center w-full h-full"
            >
              <TutorialIllustration step={currentStep} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Step content */}
        <div className="px-6 py-4 text-center min-h-[100px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-base font-semibold text-foreground mb-2">
                {t(`mobileRankingTutorial.${stepContent.titleKey}`)}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t(`mobileRankingTutorial.${stepContent.descKey}`)}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 pb-4">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => {
            const step = (i + 1) as TutorialStep;
            return (
              <button
                key={step}
                onClick={() => handleDotClick(step)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  currentStep === step
                    ? "bg-primary w-6"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Step ${step}`}
              />
            );
          })}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between px-6 pb-6 gap-4">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground"
          >
            {t("mobileRankingTutorial.skip")}
          </Button>
          <Button onClick={handleNext}>
            {isLastStep
              ? t("mobileRankingTutorial.done")
              : t("mobileRankingTutorial.next")}
          </Button>
        </div>
      </motion.div>
    </div>
  );
});
