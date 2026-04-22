import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { betterAuth } from "better-auth/minimal";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL!;
const secret = process.env.BETTER_AUTH_SECRET!;

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    secret,
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [
      convex({
        authConfig,
        jwt: {
          expirationSeconds: 60 * 60 * 24 * 7,
        },
      }),
    ],
  });
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    try {
      return await authComponent.getAuthUser(ctx);
    } catch {
      return null;
    }
  },
});

export const getUser = async (ctx: any) => {
  try {
    return await authComponent.getAuthUser(ctx);
  } catch {
    return null;
  }
};

export const getUserName = async (ctx: any): Promise<string> => {
  const user = await getUser(ctx);
  return (user as any)?.name || (user as any)?.email?.split("@")[0] || user?._id?.toString().slice(0, 8) || "Unknown";
};

export const resolveAuthorNames = async (ctx: any, authorIds: string[]): Promise<Map<string, string>> => {
  const names = new Map<string, string>();
  const uniqueIds = [...new Set(authorIds)];

  for (const authorId of uniqueIds) {
    try {
      const user = await ctx.runQuery(components.betterAuth.adapter.findOne, {
        model: "user",
        where: [{ field: "_id", operator: "eq" as const, value: authorId }],
      });
      if (user) {
        names.set(authorId, (user as any).name || (user as any).email?.split("@")[0] || authorId.slice(0, 8));
      } else {
        names.set(authorId, authorId.slice(0, 8));
      }
    } catch {
      names.set(authorId, authorId.slice(0, 8));
    }
  }

  return names;
};
