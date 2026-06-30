"use client";

import { motion, useReducedMotion } from "framer-motion";

export function FadeIn({ 
  children, 
  delay = 0,
  direction = "up",
  className = ""
}: { 
  children: React.ReactNode, 
  delay?: number,
  direction?: "up" | "down" | "left" | "right" | "none",
  className?: string
}) {
  const shouldReduceMotion = useReducedMotion();

  const directions = {
    up: { y: 15, x: 0 },
    down: { y: -15, x: 0 },
    left: { x: 15, y: 0 },
    right: { x: -15, y: 0 },
    none: { x: 0, y: 0 }
  };

  return (
    <motion.div
      className={className}
      initial={{ 
        opacity: 0, 
        ...(shouldReduceMotion ? {} : directions[direction])
      }}
      whileInView={{ 
        opacity: 1, 
        x: 0, 
        y: 0 
      }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ 
        duration: shouldReduceMotion ? 0.1 : 0.4, 
        delay: shouldReduceMotion ? 0 : delay, 
        ease: "easeOut" 
      }}
    >
      {children}
    </motion.div>
  );
}
