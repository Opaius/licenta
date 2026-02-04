import "server-only";

import { api } from "@convex/api";
import { meta } from "@convex/meta";
import type { Api } from "@convex/types";
import type { FetchQueryOptions } from "@tanstack/react-query";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import {
  createServerCRPCProxy,
  getServerQueryClientOptions,
} from "better-convex/rsc";
import { headers } from "next/headers";
import { cache } from "react";

import { hydrationConfig } from "./query-client";
import { createCaller, createContext } from "./server";

// RSC context factory - wraps createContext with cache() and next/headers
const createRSCContext = cache(async () =>
  createContext({ headers: await headers() }),
);

// Server caller - direct calls without caching/hydration
export const caller = createCaller(createRSCContext);

// Server-compatible cRPC proxy (queryOptions only)
export const crpc = createServerCRPCProxy<Api>({ api, meta });

// Create server QueryClient with HTTP-based fetching
function createServerQueryClient() {
  return new QueryClient({
    defaultOptions: {
      ...hydrationConfig, // SuperJSON serialization for SSR
      ...getServerQueryClientOptions({
        getToken: caller.getToken,
        convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
      }),
    },
  });
}

// Cache QueryClient per request
export const getQueryClient = cache(createServerQueryClient);

// Fire-and-forget prefetch for client hydration
export function prefetch<T extends { queryKey: readonly unknown[] }>(
  queryOptions: T,
): void {
  void getQueryClient().prefetchQuery(queryOptions);
}

// Hydration wrapper for client components
export function HydrateClient({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
  );
}

/**
 * Preload a query - returns data + hydrates for client.
 * Use for server-side data access (metadata, conditionals).
 */
export function preloadQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = readonly unknown[],
>(
  options: FetchQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): Promise<TData> {
  return getQueryClient().fetchQuery(options);
}
