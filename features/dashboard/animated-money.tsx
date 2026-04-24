"use client";

import { animate, useMotionValue, useTransform, motion } from "framer-motion";
import { useEffect } from "react";

import { formatMoney } from "@/lib/utils";

export function AnimatedMoney({ value, currency, className }: { value: number; currency: string; className?: string }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => formatMoney(Math.round(latest), currency));

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.45,
      ease: "easeOut"
    });

    return controls.stop;
  }, [motionValue, value]);

  return <motion.span className={className}>{rounded}</motion.span>;
}
