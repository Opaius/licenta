import { classed } from "@tw-classed/react";
import { motion } from "motion/react";
export const FieldError = classed("div", "text-destructive text-sm");
export const FieldErrorMotion = motion.create(FieldError);
