import { Variants } from "framer-motion";

export const animations = {
  fadeUp: {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  },

  fadeIn: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
  },

  scaleIn: {
    hidden: { opacity: 0, height: 0 },
    show: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.25, ease: "easeOut" },
    },
  },
  fieldError: {
    hidden: { opacity: 0, height: 0, margin: 0 },
    show: {
      opacity: 1,
      height: "auto",
      margin: "12px 0",
      transition: { duration: 0.25, ease: "easeOut" },
    },
  },
} satisfies Record<string, Variants>;
export type MotionVariantName = keyof typeof animations;
