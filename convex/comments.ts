import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUser } from "./auth";
import { resolveAuthorNames } from "./auth";

export const getComments = query({
  args: { promptId: v.id("prompts"), versionId: v.optional(v.id("promptVersions")) },
  handler: async (ctx, { promptId, versionId }) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_prompt", (q) => q.eq("promptId", promptId))
      .collect();

    const withAuthors = await (async () => {
      const authorIds = comments.map((c) => c.authorId);
      const nameMap = await resolveAuthorNames(ctx, authorIds);
      return comments.map((c) => ({
        ...c,
        authorName: c.authorName ?? nameMap.get(c.authorId) ?? "Unknown",
      }));
    })();

    if (versionId) {
      return withAuthors.filter((c) => c.versionId === versionId);
    }
    return withAuthors;
  },
});

export const getChat = query({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, { promptId }) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_prompt", (q) => q.eq("promptId", promptId))
      .collect();

    const chatMessages = comments.filter((c) => !c.versionId && !c.parentId);

    const authorIds = chatMessages.map((c) => c.authorId);
    const nameMap = await resolveAuthorNames(ctx, authorIds);

    return chatMessages.map((c) => ({
      ...c,
      authorName: c.authorName ?? nameMap.get(c.authorId) ?? "Unknown",
    }));
  },
});

export const addComment = mutation({
  args: {
    promptId: v.id("prompts"),
    content: v.string(),
    versionId: v.optional(v.id("promptVersions")),
    selectionStart: v.optional(v.number()),
    selectionEnd: v.optional(v.number()),
  },
  handler: async (ctx, { promptId, content, versionId, selectionStart, selectionEnd }) => {
    const user = await getUser(ctx);
    if (!user) throw new Error("Must be logged in to comment");

    const commentId = await ctx.db.insert("comments", {
      promptId,
      versionId,
      content,
      selectionStart,
      selectionEnd,
      authorId: user._id,
      authorName: user.name ?? user._id.slice(0, 8),
      resolved: false,
      parentId: undefined,
      createdAt: Date.now(),
    });
    return commentId;
  },
});

export const addChatMessage = mutation({
  args: {
    promptId: v.id("prompts"),
    content: v.string(),
  },
  handler: async (ctx, { promptId, content }) => {
    const user = await getUser(ctx);
    if (!user) throw new Error("Must be logged in to chat");

    const messageId = await ctx.db.insert("comments", {
      promptId,
      versionId: undefined,
      content,
      selectionStart: undefined,
      selectionEnd: undefined,
      authorId: user._id,
      authorName: user.name ?? user._id.slice(0, 8),
      resolved: false,
      parentId: undefined,
      createdAt: Date.now(),
    });
    return messageId;
  },
});

export const replyComment = mutation({
  args: { parentId: v.id("comments"), content: v.string() },
  handler: async (ctx, { parentId, content }) => {
    const user = await getUser(ctx);
    if (!user) throw new Error("Must be logged in to reply");

    const parent = await ctx.db.get(parentId);
    if (!parent) throw new Error("Parent comment not found");
    if (!("promptId" in parent)) throw new Error("Invalid comment");

    const replyId = await ctx.db.insert("comments", {
      promptId: parent.promptId,
      versionId: "versionId" in parent ? parent.versionId : undefined,
      content,
      authorId: user._id,
      authorName: user.name ?? user._id.slice(0, 8),
      resolved: false,
      parentId,
      createdAt: Date.now(),
    });
    return replyId;
  },
});

export const resolveComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, { commentId }) => {
    const user = await getUser(ctx);
    if (!user) throw new Error("Must be logged in to resolve");

    const comment = await ctx.db.get(commentId);
    if (!comment) throw new Error("Comment not found");

    await ctx.db.patch(commentId, { resolved: true });
  },
});

export const deleteComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, { commentId }) => {
    const user = await getUser(ctx);
    if (!user) throw new Error("Must be logged in to delete");

    const comment = await ctx.db.get(commentId);
    if (!comment) throw new Error("Comment not found");
    if (comment.authorId !== user._id) throw new Error("Can only delete your own comments");

    await ctx.db.delete(commentId);
  },
});
