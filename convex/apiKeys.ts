import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUser } from "./auth";

function encodeKey(secret: string): string {
  return Buffer.from(secret).toString("base64");
}

function decodeKey(encoded: string): string {
  return Buffer.from(encoded, "base64").toString("utf8");
}

async function getWorkspaceAccess(
  ctx: any,
  workspaceId: string,
  userId: string
): Promise<"owner" | "editor" | "viewer" | null> {
  const workspace = await ctx.db.get(workspaceId);
  if (workspace?.ownerId === userId) return "owner";

  const membership = await ctx.db
    .query("workspaceMembers")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .filter((q: any) => q.eq(q.field("workspaceId"), workspaceId))
    .first();

  return membership?.role ?? null;
}

export const listApiKeys = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const access = await getWorkspaceAccess(ctx, args.workspaceId, user._id.toString());
    if (!access) throw new Error("Access denied");
    if (access === "viewer") return []; // viewers can't see keys

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

    const access = await getWorkspaceAccess(ctx, args.workspaceId, user._id.toString());
    if (!access || access === "viewer") {
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

    const access = await getWorkspaceAccess(ctx, key.workspaceId, user._id.toString());
    if (!access || access === "viewer") {
      throw new Error("Access denied");
    }

    await ctx.db.delete(args.keyId);
  },
});

export const listModels = query({
  args: { keyId: v.id("apiKeys") },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const key = await ctx.db.get(args.keyId);
    if (!key) throw new Error("Key not found");

    const access = await getWorkspaceAccess(ctx, key.workspaceId, user._id.toString());
    if (!access || access === "viewer") throw new Error("Access denied");

    const secret = decodeKey(key.encryptedKey);

    if (key.provider === "openai") {
      const response = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${secret}` },
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${error}`);
      }
      const data = await response.json();
      return data.data
        .filter((m: any) => m.id.startsWith("gpt-") || m.id.startsWith("o-"))
        .map((m: any) => ({ id: m.id, name: m.id }));
    }

    if (key.provider === "anthropic") {
      const response = await fetch("https://api.anthropic.com/v1/models", {
        headers: {
          Authorization: `Bearer ${secret}`,
          "x-api-key": secret,
          "anthropic-version": "2023-06-01",
        },
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Anthropic API error: ${error}`);
      }
      const data = await response.json();
      return data.data.map((m: any) => ({ id: m.id, name: m.display_name || m.id }));
    }

    if (key.provider === "ollama") {
      const response = await fetch("http://localhost:11434/api/tags", {});
      if (!response.ok) throw new Error("Ollama not available");
      const data = await response.json();
      return data.models.map((m: any) => ({ id: m.name, name: m.name }));
    }

    return [];
  },
});

export const getApiKey = query({
  args: { keyId: v.id("apiKeys") },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const key = await ctx.db.get(args.keyId);
    if (!key) throw new Error("Key not found");

    const access = await getWorkspaceAccess(ctx, key.workspaceId, user._id.toString());
    if (!access) throw new Error("Access denied");

    return {
      _id: key._id,
      provider: key.provider,
      label: key.label,
      secret: decodeKey(key.encryptedKey),
      createdAt: key.createdAt,
    };
  },
});