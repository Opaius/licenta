import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUser } from "./auth";

export const getVotes = query({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, { promptId }) => {
    return ctx.db.query("votes").withIndex("by_prompt", (q) => q.eq("promptId", promptId)).collect();
  },
});

export const getUserVote = query({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, { promptId }) => {
    const user = await getUser(ctx);
    if (!user) return null;
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_user_prompt", (q) => q.eq("userId", user._id).eq("promptId", promptId))
      .first();
    return votes;
  },
});

export const getVoteCount = query({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, { promptId }) => {
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_prompt", (q) => q.eq("promptId", promptId))
      .collect();
    return votes.reduce((sum, vote) => sum + vote.value, 0);
  },
});

export const votePrompt = mutation({
  args: { promptId: v.id("prompts"), value: v.union(v.literal(1), v.literal(-1)) },
  handler: async (ctx, { promptId, value }) => {
    const user = await getUser(ctx);
    if (!user) throw new Error("Must be logged in to vote");
    const userId = user._id;

    const existing = await ctx.db
      .query("votes")
      .withIndex("by_user_prompt", (q) => q.eq("userId", userId).eq("promptId", promptId))
      .first();

    if (existing) {
      if (existing.value === value) {
        await ctx.db.delete(existing._id);
        return { action: "removed", value };
      } else {
        await ctx.db.patch(existing._id, { value, createdAt: Date.now() });
        return { action: "changed", value };
      }
    }

    await ctx.db.insert("votes", {
      promptId,
      userId,
      value,
      createdAt: Date.now(),
    });
    return { action: "added", value };
  },
});