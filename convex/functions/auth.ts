import { betterAuth, type BetterAuthOptions } from "better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { admin } from "better-auth/plugins";
import {
  createClient,
  createApi,
  type AuthFunctions,
} from "better-convex/auth";
import { internal } from "./_generated/api";
import {
  type MutationCtx,
  type QueryCtx,
  type ActionCtx,
  internalMutation,
} from "./_generated/server";
import type { DataModel } from "./_generated/dataModel";
import schema from "./schema";
import authConfig from "./auth.config";

type GenericCtx = QueryCtx | MutationCtx | ActionCtx;
const authFunctions: AuthFunctions = internal.auth;

// Create client with Convex adapter and triggers
export const authClient = createClient<DataModel, typeof schema>({
  authFunctions,
  schema,
  internalMutation,
});

// Auth options factory
export const createAuthOptions = (ctx: GenericCtx) =>
  ({
    baseURL: process.env.SITE_URL!,
    database: authClient.httpAdapter(ctx),
    plugins: [
      convex({
        authConfig,
        jwks: process.env.JWKS,
      }),
      admin(),
    ],
    session: {
      expiresIn: 60 * 60 * 24 * 30, // 30 days
      updateAge: 60 * 60 * 24 * 15, // 15 days
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },
    // Fallback for CLI schema generation
    trustedOrigins: [process.env.SITE_URL ?? "http://localhost:3000"],
  }) satisfies BetterAuthOptions;

// Create auth instance for HTTP routes
export const createAuth = (ctx: GenericCtx) =>
  betterAuth(createAuthOptions(ctx));

// IMPORTANT: Use getAuth for queries/mutations (direct DB access)
export const getAuth = <Ctx extends QueryCtx | MutationCtx>(ctx: Ctx) => {
  return betterAuth({
    ...createAuthOptions(ctx),
    database: authClient.adapter(ctx, createAuthOptions),
  });
};

// Export trigger handlers for Convex
export const {
  beforeCreate,
  beforeDelete,
  beforeUpdate,
  onCreate,
  onDelete,
  onUpdate,
} = authClient.triggersApi();

// Export CRUD functions for Better Auth
export const {
  create,
  deleteMany,
  deleteOne,
  findMany,
  findOne,
  updateMany,
  updateOne,
  getLatestJwks,
  rotateKeys,
} = createApi(schema, createAuth, {
  internalMutation, // Optional: same wrapper as createClient
  skipValidation: true, // Smaller generated types
});

// Export auth instance for Better Auth CLI
// biome-ignore lint/suspicious/noExplicitAny: Required for CLI
export const auth = betterAuth(createAuthOptions({} as any));
