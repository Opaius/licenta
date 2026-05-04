import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUser, resolveAuthorNames } from "./auth";

export const getMembership = query({
  args: { workspaceId: v.id("workspaces"), userId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .first();
  },
});

export const listMembers = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user || !user._id) throw new Error("Not authenticated");
    const userId = user._id.toString();
    const workspace = await ctx.db.get(args.workspaceId);

    if (!workspace) throw new Error("Workspace not found");

    if (workspace.ownerId !== userId && !workspace.isPublic) {
      const membership = await ctx.db
        .query("workspaceMembers")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
        .first();

      if (!membership) throw new Error("Access denied");
    }

    const members = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const userIds = members.map(m => m.userId);
    const nameMap = await resolveAuthorNames(ctx, userIds);

    return members.map(m => ({
      ...m,
      name: nameMap.get(m.userId),
    }));
  },
});

export const addMember = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.string(),
    role: v.union(v.literal("editor"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user || !user._id) throw new Error("Not authenticated");
    const currentUserId = user._id.toString();
    const workspace = await ctx.db.get(args.workspaceId);
    
    if (!workspace) throw new Error("Workspace not found");
    if (workspace.ownerId !== currentUserId) throw new Error("Only owner can add members");
    
    if (workspace.ownerId === args.userId) {
      throw new Error("Cannot add workspace owner as member");
    }
    
    const existing = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .first();
    
    if (existing) {
      throw new Error("User is already a member");
    }
    
    const memberId = await ctx.db.insert("workspaceMembers", {
      workspaceId: args.workspaceId,
      userId: args.userId,
      role: args.role,
      joinedAt: Date.now(),
    });
    
    return memberId;
  },
});

export const removeMember = mutation({
  args: { workspaceId: v.id("workspaces"), userId: v.string() },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user || !user._id) throw new Error("Not authenticated");
    const currentUserId = user._id.toString();
    const workspace = await ctx.db.get(args.workspaceId);
    
    if (!workspace) throw new Error("Workspace not found");
    if (workspace.ownerId !== currentUserId) throw new Error("Only owner can remove members");
    
    if (workspace.ownerId === args.userId) {
      throw new Error("Cannot remove workspace owner");
    }
    
    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .first();
    
    if (!membership) throw new Error("User is not a member");
    
    await ctx.db.delete(membership._id);
    
    return true;
  },
});

export const updateMemberRole = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.string(),
    role: v.union(v.literal("editor"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user || !user._id) throw new Error("Not authenticated");
    const currentUserId = user._id.toString();
    const workspace = await ctx.db.get(args.workspaceId);
    
    if (!workspace) throw new Error("Workspace not found");
    if (workspace.ownerId !== currentUserId) throw new Error("Only owner can update member roles");
    
    if (workspace.ownerId === args.userId) {
      throw new Error("Cannot change workspace owner role");
    }
    
    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .first();
    
    if (!membership) throw new Error("User is not a member");
    
    await ctx.db.patch(membership._id, { role: args.role });
    
    return membership._id;
  },
});