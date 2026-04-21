"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "@felte/react";
import { validator } from "@felte/validator-zod";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";

function toFieldErrors(errors?: string | string[]): Array<{ message?: string }> {
  if (!errors) return [];
  if (typeof errors === "string") return [{ message: errors }];
  return errors.map((message) => ({ message }));
}

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function AuthPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const { form: loginForm, errors: loginErrors, isValid: loginIsValid, isSubmitting: loginSubmitting } = useForm({
    validate: validator({ schema: loginSchema }),
    onSubmit: async (values) => {
      setError("");
      const { error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });
      if (error) {
        // Better-auth error has message and optionally statusCode
        setError(error.message || "Invalid credentials");
      } else {
        router.push("/dashboard");
      }
    },
  });

  const { form: signupForm, errors: signupErrors, isValid: signupIsValid, isSubmitting: signupSubmitting } = useForm({
    validate: validator({ schema: signupSchema }),
    onSubmit: async (values) => {
      setError("");
      const { error } = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
      });
      if (error) {
        setError(error.message || "Signup failed");
      } else {
        router.push("/dashboard");
      }
    },
  });

  const loading = loginSubmitting() || signupSubmitting();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <Link href="/" className="text-2xl font-bold font-heading mb-2 text-card-foreground">
            Stratum Live
          </Link>
          <CardDescription className="text-muted-foreground">
            Collaborative prompt engineering
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Log in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-4">
              <form ref={loginForm} method="post" className="space-y-4" noValidate>
                {error && (
                  <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
                    {error}
                  </div>
                )}
                <Field>
                  <FieldLabel htmlFor="login-email">Email</FieldLabel>
                  <FieldContent>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                    />
                  </FieldContent>
                  <FieldError errors={toFieldErrors(loginErrors().email)} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="login-password">Password</FieldLabel>
                  <FieldContent>
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                    />
                  </FieldContent>
                  <FieldError errors={toFieldErrors(loginErrors().password)} />
                </Field>
                <Button type="submit" disabled={loading || !loginIsValid} className="w-full">
                  {loading ? "Loading..." : "Log in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-4">
              <form ref={signupForm} method="post" className="space-y-4" noValidate>
                {error && (
                  <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
                    {error}
                  </div>
                )}
                <Field>
                  <FieldLabel htmlFor="signup-name">Name</FieldLabel>
                  <FieldContent>
                    <Input
                      id="signup-name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                    />
                  </FieldContent>
                  <FieldError errors={toFieldErrors(signupErrors().name)} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="signup-email">Email</FieldLabel>
                  <FieldContent>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                    />
                  </FieldContent>
                  <FieldError errors={toFieldErrors(signupErrors().email)} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="signup-password">Password</FieldLabel>
                  <FieldContent>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                    />
                  </FieldContent>
                  <FieldError errors={toFieldErrors(signupErrors().password)} />
                </Field>
                <Button type="submit" disabled={loading || !signupIsValid} className="w-full">
                  {loading ? "Loading..." : "Sign up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
