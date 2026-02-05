import z4 from "zod/v4";

export const loginSchema = z4.object({
  email: z4.email("Please provide a valid email address"),
  password: z4
    .string("Please enter a password")
    .min(6, "Password must be at least 6 characters long"),
});

// passwordRules.ts
export const passwordRules = [
  {
    id: "minLength",
    test: (v: string) => v.length >= 6,
    message: "At least 6 characters",
  },
  {
    id: "uppercase",
    test: (v: string) => /[A-Z]/.test(v),
    message: "At least one uppercase letter",
  },
  {
    id: "lowercase",
    test: (v: string) => /[a-z]/.test(v),
    message: "At least one lowercase letter",
  },
  {
    id: "number",
    test: (v: string) => /[0-9]/.test(v),
    message: "At least one number",
  },
] as const;

export const registerSchema = z4
  .object({
    email: z4.email("Please provide a valid email address"),
    name: z4
      .string("Please enter your name")
      .nonempty("Please enter your name"),
    password: z4
      .string("Please enter a password")
      .nonempty("Please enter a password")
      .superRefine((val, ctx) => {
        passwordRules.forEach((rule) => {
          if (!rule.test(val)) {
            ctx.addIssue({
              code: "custom",
              message: rule.message,
            });
          }
        });
      }),
    confirmPassword: z4.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
  });
