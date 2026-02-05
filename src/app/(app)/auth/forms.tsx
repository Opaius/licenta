"use client";

import { getFormProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { H1 } from "@/components/typeography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
  FieldContent,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";
import { loginSchema, registerSchema } from "@/lib/schemas/auth";
import { FieldErrorMotion } from "@/components/input-error";
import { AnimatePresence } from "motion/react";
import { animations } from "@/lib/animation/framer";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { authClient } from "@/lib/convex/auth-client";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [error, setError] = useState<string | undefined>(undefined);
  const router = useRouter();

  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: loginSchema });
    },
    async onSubmit(event) {
      event.preventDefault();

      const { error } = await authClient.signIn.email({
        email: fields.email.value!,
        password: fields.password.value!,
      });
      error ? setError(error.message) : router.push("/dashboard");
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <TabsContent value="login">
      <Card className="w-full md:w-[450px] mx-auto">
        <CardHeader>
          <CardTitle>
            <H1 size="sm" className="text-center">
              Welcome Back!
            </H1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form {...getFormProps(form)}>
            <FieldGroup>
              {/* Email Field */}
              <Field data-invalid={!!fields.email.errors}>
                <FieldContent>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <FieldDescription>
                    Please enter your email address to login to your account.
                  </FieldDescription>
                </FieldContent>
                <div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email"
                    defaultValue={fields.email.initialValue ?? ""}
                    aria-invalid={!!fields.email.errors}
                  />
                  <AnimatePresence>
                    {fields.email.errors && (
                      <FieldErrorMotion
                        key={fields.email.id + fields.email.errors[0]}
                        variants={animations.fieldError}
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                      >
                        {fields.email.errors[0]}
                      </FieldErrorMotion>
                    )}
                  </AnimatePresence>
                </div>
              </Field>

              {/* Password Field */}
              <Field data-invalid={!!fields.password.errors}>
                <FieldContent>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <FieldDescription>
                    Please enter your password to login to your account.
                  </FieldDescription>
                </FieldContent>
                <div>
                  <Input
                    showPassword
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Password"
                    defaultValue={fields.password.initialValue ?? ""}
                    aria-invalid={!!fields.password.errors}
                  />
                  <AnimatePresence>
                    {fields.password.errors && (
                      <FieldErrorMotion
                        key={fields.password.id + fields.password.errors[0]}
                        variants={animations.fieldError}
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                      >
                        {fields.password.errors[0]}
                      </FieldErrorMotion>
                    )}
                  </AnimatePresence>
                </div>
              </Field>
            </FieldGroup>
            <AnimatePresence>
              {error && (
                <FieldErrorMotion
                  key="form-error"
                  variants={animations.fieldError}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                >
                  {error}
                </FieldErrorMotion>
              )}
            </AnimatePresence>
            <Button type="submit" className="w-full mt-3">
              Log in
            </Button>
          </form>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
export function RegisterForm() {
  const [error, setError] = useState<string | undefined>(undefined);
  const router = useRouter();
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: registerSchema });
    },
    async onSubmit(event) {
      event.preventDefault();

      const { error } = await authClient.signUp.email({
        email: fields.email.value!,
        password: fields.password.value!,
        name: fields.name.value!,
      });
      error ? setError(error.message) : router.push("/dashboard");
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <TabsContent value="register">
      <Card className="w-full md:w-[450px] mx-auto">
        <CardHeader>
          <CardTitle>
            <H1 size="sm" className="text-center">
              Hello hello, new friend! (potentially)
            </H1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form {...getFormProps(form)}>
            <FieldGroup>
              {/* Email Field */}
              <Field data-invalid={!!fields.email.errors}>
                <FieldContent>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <FieldDescription>
                    Please enter your email address to login to your account.
                  </FieldDescription>
                </FieldContent>
                <div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email"
                    defaultValue={fields.email.initialValue ?? ""}
                    aria-invalid={!!fields.email.errors}
                  />
                  <AnimatePresence>
                    {fields.email.errors && (
                      <FieldErrorMotion
                        key={fields.email.id + fields.email.errors[0]}
                        variants={animations.fieldError}
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                      >
                        {fields.email.errors[0]}
                      </FieldErrorMotion>
                    )}
                  </AnimatePresence>
                </div>
              </Field>

              {/* Name Field */}
              <Field data-invalid={!!fields.name.errors}>
                <FieldContent>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <FieldDescription>
                    Please enter your name to register for an account.
                  </FieldDescription>
                </FieldContent>
                <div>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Name"
                    defaultValue={fields.name.initialValue ?? ""}
                    aria-invalid={!!fields.name.errors}
                  />
                  <AnimatePresence>
                    {fields.name.errors && (
                      <FieldErrorMotion
                        key={fields.name.id + fields.name.errors[0]}
                        variants={animations.fieldError}
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                      >
                        {fields.name.errors[0]}
                      </FieldErrorMotion>
                    )}
                  </AnimatePresence>
                </div>
              </Field>

              <div>
                {/* Password Field */}
                <Field data-invalid={!!fields.password.errors}>
                  <FieldContent>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <FieldDescription>
                      Please enter your password to login to your account.
                    </FieldDescription>
                  </FieldContent>
                  <div>
                    <Input
                      showPassword
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Password"
                      defaultValue={fields.password.initialValue ?? ""}
                      aria-invalid={!!fields.password.errors}
                    />
                    <AnimatePresence>
                      {fields.password.errors && (
                        <FieldErrorMotion
                          key={fields.password.id + fields.password.errors[0]}
                          variants={animations.fieldError}
                          initial="hidden"
                          animate="show"
                          exit="hidden"
                        >
                          {fields.password.errors[0]}
                        </FieldErrorMotion>
                      )}
                    </AnimatePresence>
                  </div>
                </Field>
                {/* Confirm Password Field */}
                <Field data-invalid={!!fields.confirmPassword.errors}>
                  <div>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm"
                      className="my-3"
                      defaultValue={fields.confirmPassword.initialValue ?? ""}
                      aria-invalid={!!fields.confirmPassword.errors}
                    />
                    <AnimatePresence>
                      {fields.confirmPassword.errors && (
                        <FieldErrorMotion
                          key={
                            fields.confirmPassword.id +
                            fields.confirmPassword.errors[0]
                          }
                          variants={animations.fieldError}
                          initial="hidden"
                          animate="show"
                          exit="hidden"
                        >
                          {fields.confirmPassword.errors[0]}
                        </FieldErrorMotion>
                      )}
                    </AnimatePresence>
                  </div>
                </Field>
              </div>
            </FieldGroup>
            <AnimatePresence>
              {error && (
                <FieldErrorMotion
                  key="form-error"
                  variants={animations.fieldError}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                >
                  {error}
                </FieldErrorMotion>
              )}
            </AnimatePresence>
            <Button type="submit" className="w-full mt-3">
              Register
            </Button>
          </form>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
