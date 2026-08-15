import type { Variants } from "framer-motion";

export const viewportOnce = { once: true, amount: 0.2 } as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

export const EASE_GLIDE = [0.16, 1, 0.3, 1] as const;

// Branch locally: MotionConfig would drop transforms and leave hidden content
// translated off-screen under reduced motion.
const FADE: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
};

export function maskUp(reduce: boolean): Variants {
  if (reduce) return FADE;
  return {
    hidden: { y: "115%", opacity: 0 },
    show: (delay: number = 0) => ({
      y: "0%",
      opacity: 1,
      transition: { duration: 0.9, ease: EASE_GLIDE, delay },
    }),
  };
}

export function riseIn(reduce: boolean): Variants {
  if (reduce) return FADE;
  return {
    hidden: { y: 22, opacity: 0 },
    show: (delay: number = 0) => ({
      y: 0,
      opacity: 1,
      transition: { duration: 0.7, ease: EASE_GLIDE, delay },
    }),
  };
}
