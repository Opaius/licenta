"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "better-convex/auth-client";
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import type { Auth } from "@convex/auth-shared";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SITE_URL,
  plugins: [inferAdditionalFields<Auth>(), convexClient()],
});

export function ConvexProvider({
  children,
  token,
}: {
  children: React.ReactNode;
  token?: string;
}) {
  return (
    <ConvexAuthProvider
      client={convex}
      authClient={authClient}
      initialToken={token}
    >
      {children}
    </ConvexAuthProvider>
  );
}
