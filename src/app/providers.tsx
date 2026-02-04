"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ConvexProvider,
  ConvexReactClient,
  getQueryClientSingleton,
  getConvexQueryClientSingleton,
} from "better-convex/react";
import { CRPCProvider } from "@/lib/convex/crpc";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity } },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <QueryProvider>{children}</QueryProvider>
    </ConvexProvider>
  );
}

function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClientSingleton(createQueryClient);
  const convexQueryClient = getConvexQueryClientSingleton({
    convex,
    queryClient,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <CRPCProvider convexClient={convex} convexQueryClient={convexQueryClient}>
        {children}
      </CRPCProvider>
    </QueryClientProvider>
  );
}
