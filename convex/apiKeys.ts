import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUser } from "./auth";

function encodeKey(secret: string): string {
  return Buffer.from(secret).toString("base64");
}

function decodeKey(encoded: string): string {
  return Buffer.from(encoded, "base64").toString("utf8");
}

export const listApiKeys = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .first();

    if (!membership) throw new Error("Access denied");

    const keys = await ctx.db
      .query("apiKeys")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    return keys.map((k) => ({
      _id: k._id,
      provider: k.provider,
      label: k.label,
      maskedKey: `${decodeKey(k.encryptedKey).slice(0, 4)}...${decodeKey(k.encryptedKey).slice(-4)}`,
      createdAt: k.createdAt,
    }));
  },
});

export const addApiKey = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    provider: v.union(v.literal("openai"), v.literal("anthropic"), v.literal("ollama")),
    secret: v.string(),
    label: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .first();

    if (!membership || membership.role === "viewer") {
      throw new Error("Access denied");
    }

    const keyId = await ctx.db.insert("apiKeys", {
      workspaceId: args.workspaceId,
      provider: args.provider,
      encryptedKey: encodeKey(args.secret),
      label: args.label,
      createdAt: Date.now(),
    });

    return keyId;
  },
});

export const deleteApiKey = mutation({
  args: { keyId: v.id("apiKeys") },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const key = await ctx.db.get(args.keyId);
    if (!key) throw new Error("Key not found");

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("workspaceId"), key.workspaceId))
      .first();

    if (!membership || membership.role === "viewer") {
      throw new Error("Access denied");
    }

    await ctx.db.delete(args.keyId);
  },
});

export const getApiKey = query({
  args: { keyId: v.id("apiKeys") },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const key = await ctx.db.get(args.keyId);
    if (!key) throw new Error("Key not found");

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("workspaceId"), key.workspaceId))
      .first();

    if (!membership) throw new Error("Access denied");

    return {
      _id: key._id,
      provider: key.provider,
      label: key.label,
      secret: decodeKey(key.encryptedKey),
      createdAt: key.createdAt,
    };
  },
});