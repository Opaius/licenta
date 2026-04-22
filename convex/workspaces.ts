import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { authComponent, getUser } from "./auth";

export const listWorkspaces = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user || !user._id) throw new Error("Not authenticated");
    const userId = user._id.toString();

    const owned = await ctx.db
      .query("workspaces")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();

    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const memberWorkspaceIds = [...new Set(memberships.map((m) => m.workspaceId))];
    const memberWorkspaces = await Promise.all(
      memberWorkspaceIds.map((id) => ctx.db.get(id))
    ).then((results) => results.filter((w): w is NonNullable<typeof w> => w !== null));

    const allWorkspaceIds = [
      ...owned.map((w) => w._id),
      ...memberWorkspaces.map((w) => w._id),
    ];

    // Fetch counts for all workspaces in bulk
    const [memberCounts, promptCounts] = await Promise.all([
      // Count members per workspace
      ctx.db
        .query("workspaceMembers")
        .collect()
        .then((members) => {
          const counts = new Map<string, number>();
          for (const m of members) {
            if (allWorkspaceIds.includes(m.workspaceId)) {
              counts.set(m.workspaceId.toString(), (counts.get(m.workspaceId.toString()) || 0) + 1);
            }
          }
          return counts;
        }),
      // Count prompts per workspace
      ctx.db
        .query("prompts")
        .collect()
        .then((prompts) => {
          const counts = new Map<string, number>();
          for (const p of prompts) {
            if (allWorkspaceIds.includes(p.workspaceId)) {
              counts.set(p.workspaceId.toString(), (counts.get(p.workspaceId.toString()) || 0) + 1);
            }
          }
          return counts;
        }),
    ]);

    const allWorkspaces = [
      ...owned.map((w) => ({
        ...w,
        role: "owner" as const,
        memberCount: memberCounts.get(w._id.toString()) || 0,
        promptsCount: promptCounts.get(w._id.toString()) || 0,
      })),
      ...memberWorkspaces.map((w) => {
        const membership = memberships.find((m) => m.workspaceId === w._id);
        return {
          ...w,
          role: membership?.role ?? "viewer",
          memberCount: memberCounts.get(w._id.toString()) || 0,
          promptsCount: promptCounts.get(w._id.toString()) || 0,
        };
      }),
    ];

    return allWorkspaces.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user || !user._id) throw new Error("Not authenticated");
    const userId = user._id.toString();
    const workspace = await ctx.db.get(args.workspaceId);
    
    if (!workspace) throw new Error("Workspace not found");
    
    const isOwner = workspace.ownerId === userId;
    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .first();
    
    if (!isOwner && !membership && !workspace.isPublic) {
      throw new Error("Access denied");
    }
    
    return {
      ...workspace,
      role: isOwner ? "owner" : membership?.role ?? (workspace.isPublic ? "viewer" : null),
    };
  },
});

export const createWorkspace = mutation({
  args: { name: v.string(), isPublic: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const userId = user._id.toString();
    
    if (!args.name || args.name.trim().length === 0) {
      throw new Error("Workspace name is required");
    }
    
    if (args.name.length > 100) {
      throw new Error("Workspace name must be 100 characters or less");
    }
    
    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name.trim(),
      ownerId: userId,
      isPublic: args.isPublic ?? false,
      createdAt: Date.now(),
    });
    
    return workspaceId;
  },
});

export const updateWorkspace = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const userId = user._id.toString();
    const workspace = await ctx.db.get(args.workspaceId);
    
    if (!workspace) throw new Error("Workspace not found");
    if (workspace.ownerId !== userId) throw new Error("Only owner can update workspace");
    
    const updates: { name?: string; isPublic?: boolean } = {};
    
    if (args.name !== undefined) {
      if (args.name.trim().length === 0) throw new Error("Workspace name cannot be empty");
      if (args.name.length > 100) throw new Error("Workspace name must be 100 characters or less");
      updates.name = args.name.trim();
    }
    
    if (args.isPublic !== undefined) {
      updates.isPublic = args.isPublic;
    }
    
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.workspaceId, updates);
    }
    
    return args.workspaceId;
  },
});

export const deleteWorkspace = mutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const userId = user._id.toString();
    const workspace = await ctx.db.get(args.workspaceId);
    
    if (!workspace) throw new Error("Workspace not found");
    if (workspace.ownerId !== userId) throw new Error("Only owner can delete workspace");
    
    const members = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    for (const member of members) {
      await ctx.db.delete(member._id);
    }
    
    const invites = await ctx.db
      .query("invites")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    for (const invite of invites) {
      await ctx.db.delete(invite._id);
    }
    
    await ctx.db.delete(args.workspaceId);
    
    return true;
  },
});

export const createInvite = mutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const userId = user._id.toString();
    const workspace = await ctx.db.get(args.workspaceId);
    
    if (!workspace) throw new Error("Workspace not found");
    if (workspace.ownerId !== userId) throw new Error("Only owner can create invites");
    
    const code = crypto.randomUUID().slice(0, 8).toUpperCase();
    
    const inviteId = await ctx.db.insert("invites", {
      workspaceId: args.workspaceId,
      code,
      creatorId: userId,
      createdAt: Date.now(),
    });
    
    return { inviteId, code };
  },
});

export const joinViaInvite = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const userId = user._id.toString();
    
    if (!args.code || args.code.length < 6) {
      throw new Error("Invalid invite code");
    }
    
    const invite = await ctx.db
      .query("invites")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();
    
    if (!invite) throw new Error("Invalid invite code");
    
    const workspace = await ctx.db.get(invite.workspaceId);
    if (!workspace) throw new Error("Workspace no longer exists");
    
    const existingMembership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("workspaceId"), invite.workspaceId))
      .first();
    
    if (existingMembership) {
      throw new Error("Already a member of this workspace");
    }
    
    if (workspace.ownerId === userId) {
      throw new Error("You own this workspace");
    }
    
    const memberId = await ctx.db.insert("workspaceMembers", {
      workspaceId: invite.workspaceId,
      userId: userId,
      role: "viewer",
      joinedAt: Date.now(),
    });
    
    return { memberId, workspaceId: invite.workspaceId };
  },
});