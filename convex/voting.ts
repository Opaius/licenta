import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUser, getUserName } from "./auth";
import { createNotificationInternal } from "./notifications";

export const getVotes = query({
  args: { versionId: v.id("promptVersions") },
  handler: async (ctx, { versionId }) => {
    return ctx.db.query("votes").withIndex("by_version", (q) => q.eq("versionId", versionId)).collect();
  },
});

export const getUserVote = query({
  args: { versionId: v.id("promptVersions") },
  handler: async (ctx, { versionId }) => {
    const user = await getUser(ctx);
    if (!user) return null;
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_user_version", (q) => q.eq("userId", user._id).eq("versionId", versionId))
      .first();
    return votes;
  },
});

export const getVoteCount = query({
  args: { versionId: v.id("promptVersions") },
  handler: async (ctx, { versionId }) => {
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_version", (q) => q.eq("versionId", versionId))
      .collect();
    return votes.reduce((sum, vote) => sum + vote.value, 0);
  },
});

export const getUserVotesForPrompt = query({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, { promptId }) => {
    const user = await getUser(ctx);
    if (!user) return [];

    const versions = await ctx.db
      .query("promptVersions")
      .withIndex("by_prompt", (q) => q.eq("promptId", promptId))
      .collect();

    const versionIds = new Set(versions.map((v) => v._id));

    const votes = await ctx.db
      .query("votes")
      .withIndex("by_user_version", (q) => q.eq("userId", user._id))
      .collect();

    return votes
      .filter((vote) => vote.versionId && versionIds.has(vote.versionId))
      .map((vote) => ({ versionId: vote.versionId!, value: vote.value }));
  },
});

export const voteVersion = mutation({
  args: { versionId: v.id("promptVersions"), value: v.union(v.literal(1), v.literal(-1)) },
  handler: async (ctx, { versionId, value }) => {
    const user = await getUser(ctx);
    if (!user) throw new Error("Must be logged in to vote");
    const userId = user._id.toString();

    // Verify the version exists
    const version = await ctx.db.get(versionId);
    if (!version) throw new Error("Version not found");

    // Check if the version has been tested
    const testRun = await ctx.db
      .query("testRuns")
      .withIndex("by_version", (q) => q.eq("versionId", versionId))
      .first();

    if (!testRun) {
      throw new Error("You can only vote on versions that have been tested");
    }

    const existing = await ctx.db
      .query("votes")
      .withIndex("by_user_version", (q) => q.eq("userId", userId).eq("versionId", versionId))
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
      versionId,
      userId,
      value,
      createdAt: Date.now(),
    });

    // Notify prompt author
    const prompt = await ctx.db.get(version.promptId);
    if (prompt && prompt.authorId !== userId) {
      const userName = await getUserName(ctx);
      await createNotificationInternal(ctx, prompt.authorId, "vote", {
        promptId: version.promptId,
        fromUserId: userId,
        fromUserName: userName,
        message: value > 0 ? "voted up" : "voted down",
      });
    }

    return { action: "added", value };
  },
});
