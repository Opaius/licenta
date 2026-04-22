"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Mail, Lock, User, Loader2, Zap, Users, GitBranch } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function AuthInput({
  icon: Icon,
  ...props
}: React.ComponentProps<typeof Input> & { icon?: React.ElementType }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      )}
      <Input className={Icon ? "pl-9" : undefined} {...props} />
    </div>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const [globalError, setGlobalError] = useState("");

  const loginForm = useForm({
    defaultValues: { email: "", password: "" },
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setGlobalError("");
      const { error } = await authClient.signIn.email({
        email: value.email,
        password: value.password,
      });
      if (error) {
        setGlobalError(error.message || "Invalid credentials");
      } else {
        router.push("/dashboard");
      }
    },
  });

  const signupForm = useForm({
    defaultValues: { name: "", email: "", password: "" },
    validators: {
      onChange: signupSchema,
    },
    onSubmit: async ({ value }) => {
      setGlobalError("");
      const { error } = await authClient.signUp.email({
        email: value.email,
        password: value.password,
        name: value.name,
      });
      if (error) {
        setGlobalError(error.message || "Signup failed");
      } else {
        router.push("/dashboard");
      }
    },
  });

  const loading = loginForm.state.isSubmitting || signupForm.state.isSubmitting;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative flex-col justify-between p-12 overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-2xl font-bold font-heading tracking-tight text-foreground hover:opacity-80 transition-opacity"
          >
            <Zap className="h-6 w-6 text-primary" />
            Stratum Live
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="font-heading text-4xl font-extrabold tracking-tight mb-4 leading-tight">
            Collaborative
            <br />
            <span className="text-muted-foreground">Prompt Engineering</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Edit prompts together in real-time. Test across models. Vote on the
            best.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1.5 rounded-md bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Real-time collaboration</p>
                <p className="text-sm text-muted-foreground">
                  Edit with your team. See cursors. Every change saved.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1.5 rounded-md bg-primary/10">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Parallel testing</p>
                <p className="text-sm text-muted-foreground">
                  Run prompts across OpenAI, Anthropic, Ollama. Compare results.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1.5 rounded-md bg-primary/10">
                <GitBranch className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Version control + voting</p>
                <p className="text-sm text-muted-foreground">
                  Branches, history, restore. Vote on prompts your team likes.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-muted-foreground">
          BYOK · Bring your own keys
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-sm">
          {/* Mobile brand header */}
          <div className="lg:hidden text-center mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-2xl font-bold font-heading tracking-tight text-foreground hover:opacity-80 transition-opacity"
            >
              <Zap className="h-6 w-6 text-primary" />
              Stratum Live
            </Link>
            <p className="mt-2 text-muted-foreground text-sm">
              Collaborative prompt engineering
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-transparent p-0 h-auto mb-6">
              <TabsTrigger
                value="login"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent pb-2 text-muted-foreground data-[state=active]:text-foreground transition-colors"
              >
                Log in
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent pb-2 text-muted-foreground data-[state=active]:text-foreground transition-colors"
              >
                Sign up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  loginForm.handleSubmit();
                }}
                className="space-y-4"
                noValidate
              >
                {globalError && (
                  <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                    {globalError}
                  </div>
                )}
                <FieldGroup>
                  <loginForm.Field
                    name="email"
                    validators={{ onChange: loginSchema.shape.email }}
                    children={(field) => (
                      <Field data-invalid={field.state.meta.errors.length > 0 || undefined}>
                        <FieldLabel htmlFor="login-email">Email</FieldLabel>
                        <FieldContent>
                          <AuthInput
                            id="login-email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            icon={Mail}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={field.state.meta.errors.length > 0 || undefined}
                          />
                        </FieldContent>
                        <FieldError errors={field.state.meta.errors.map((e) => ({ message: e?.message }))} />
                      </Field>
                    )}
                  />
                  <loginForm.Field
                    name="password"
                    validators={{ onChange: loginSchema.shape.password }}
                    children={(field) => (
                      <Field data-invalid={field.state.meta.errors.length > 0 || undefined}>
                        <div className="flex items-center justify-between">
                          <FieldLabel htmlFor="login-password">Password</FieldLabel>
                          <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                            Forgot password?
                          </span>
                        </div>
                        <FieldContent>
                          <AuthInput
                            id="login-password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            icon={Lock}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={field.state.meta.errors.length > 0 || undefined}
                          />
                        </FieldContent>
                        <FieldError errors={field.state.meta.errors.map((e) => ({ message: e?.message }))} />
                      </Field>
                    )}
                  />
                </FieldGroup>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full cursor-pointer"
                >
                  {loginForm.state.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Log in"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  signupForm.handleSubmit();
                }}
                className="space-y-4"
                noValidate
              >
                {globalError && (
                  <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                    {globalError}
                  </div>
                )}
                <FieldGroup>
                  <signupForm.Field
                    name="name"
                    validators={{ onChange: signupSchema.shape.name }}
                    children={(field) => (
                      <Field data-invalid={field.state.meta.errors.length > 0 || undefined}>
                        <FieldLabel htmlFor="signup-name">Name</FieldLabel>
                        <FieldContent>
                          <AuthInput
                            id="signup-name"
                            name="name"
                            type="text"
                            placeholder="John Doe"
                            icon={User}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={field.state.meta.errors.length > 0 || undefined}
                          />
                        </FieldContent>
                        <FieldError errors={field.state.meta.errors.map((e) => ({ message: e?.message }))} />
                      </Field>
                    )}
                  />
                  <signupForm.Field
                    name="email"
                    validators={{ onChange: signupSchema.shape.email }}
                    children={(field) => (
                      <Field data-invalid={field.state.meta.errors.length > 0 || undefined}>
                        <FieldLabel htmlFor="signup-email">Email</FieldLabel>
                        <FieldContent>
                          <AuthInput
                            id="signup-email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            icon={Mail}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={field.state.meta.errors.length > 0 || undefined}
                          />
                        </FieldContent>
                        <FieldError errors={field.state.meta.errors.map((e) => ({ message: e?.message }))} />
                      </Field>
                    )}
                  />
                  <signupForm.Field
                    name="password"
                    validators={{ onChange: signupSchema.shape.password }}
                    children={(field) => (
                      <Field data-invalid={field.state.meta.errors.length > 0 || undefined}>
                        <FieldLabel htmlFor="signup-password">Password</FieldLabel>
                        <FieldContent>
                          <AuthInput
                            id="signup-password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            icon={Lock}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={field.state.meta.errors.length > 0 || undefined}
                          />
                        </FieldContent>
                        <FieldError errors={field.state.meta.errors.map((e) => ({ message: e?.message }))} />
                      </Field>
                    )}
                  />
                </FieldGroup>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full cursor-pointer"
                >
                  {signupForm.state.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Sign up"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <span className="underline underline-offset-2 hover:text-foreground cursor-pointer transition-colors">
              Terms
            </span>{" "}
            and{" "}
            <span className="underline underline-offset-2 hover:text-foreground cursor-pointer transition-colors">
              Privacy Policy
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
