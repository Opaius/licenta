"use client";
import { classed } from "@tw-classed/react";
import { motion } from "framer-motion";
export const H1 = classed("h1", "font-bold font-serif text-text", {
  variants: {
    size: {
      default: "text-4xl ",
      sm: "text-2xl ",
    },
  },
  defaultVariants: {
    size: "default",
  },
});
export const H1Motion = motion.create(H1);

export const P = classed("p", "text-lg text-muted-foreground");
export const PMotion = motion.create(P);
