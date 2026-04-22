import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUser } from "./auth";

type NotificationType = "mention" | "comment" | "vote" | "invite";

interface NotificationData {
  promptId?: string;
  commentId?: string;
  workspaceId?: string;
  fromUserId: string;
  fromUserName?: string;
  message?: string;
}

// Helper to get current userId
async function getUserIdOrThrow(ctx: any): Promise<string> {
  const user = await getUser(ctx);
  if (!user?._id) throw new Error("Not authenticated");
  return user._id.toString();
}

// === QUERIES ===

export const listNotifications = query({
  args: { read: v.optional(v.boolean()) },
  handler: async (ctx, { read }) => {
    const userId = await getUserIdOrThrow(ctx);
    
    let notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    if (read !== undefined) {
      notifications = notifications.filter((n) => n.read === read);
    }

    return notifications.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserIdOrThrow(ctx);
    
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) => q.eq("userId", userId).eq("read", false))
      .collect();

    return notifications.length;
  },
});

// === HELPER: Create notification (call from other actions) ===

export async function createNotificationInternal(
  ctx: any,
  userId: string,
  type: NotificationType,
  data: NotificationData
): Promise<string> {
  const notificationId = await ctx.db.insert("notifications", {
    userId,
    type,
    data: JSON.stringify(data),
    read: false,
    createdAt: Date.now(),
  });
  return notificationId;
}

// === MUTATIONS ===

export const createNotification = mutation({
  args: {
    userId: v.string(),
    type: v.union(
      v.literal("mention"),
      v.literal("comment"),
      v.literal("vote"),
      v.literal("invite")
    ),
    data: v.object({
      promptId: v.optional(v.string()),
      commentId: v.optional(v.string()),
      workspaceId: v.optional(v.string()),
      fromUserId: v.string(),
      fromUserName: v.optional(v.string()),
      message: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { userId, type, data }) => {
    const currentUserId = await getUserIdOrThrow(ctx);
    
    // Don't notify self
    if (userId === currentUserId) {
      return null;
    }
    
    return createNotificationInternal(ctx, userId, type, data);
  },
});

export const markRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    const userId = await getUserIdOrThrow(ctx);
    const notification = await ctx.db.get(notificationId);
    
    if (!notification) throw new Error("Notification not found");
    if (notification.userId !== userId) throw new Error("Not authorized");
    
    await ctx.db.patch(notificationId, { read: true });
  },
});

export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserIdOrThrow(ctx);
    
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) => q.eq("userId", userId).eq("read", false))
      .collect();

    await Promise.all(
      notifications.map((n) => ctx.db.patch(n._id, { read: true }))
    );
    
    return notifications.length;
  },
});

// === Notification triggers (call from other actions) ===

// Notify prompt author when someone comments on their prompt
export async function notifyComment(
  ctx: any,
  promptId: string,
  commentId: string,
  commentAuthorId: string,
  commentAuthorName?: string
) {
  // Get prompt to find author
  const prompt = await ctx.db.get(promptId as any);
  if (!prompt || !("authorId" in prompt)) return;
  
  const authorId = (prompt as any).authorId;
  if (authorId === commentAuthorId) return; // Don't notify self
  
  return createNotificationInternal(ctx, authorId, "comment", {
    promptId,
    commentId,
    fromUserId: commentAuthorId,
    fromUserName: commentAuthorName,
  });
}

// Notify mentioned user
export async function notifyMention(
  ctx: any,
  mentionedUserId: string,
  promptId: string,
  commentId: string,
  mentionerId: string,
  mentionerName?: string
) {
  if (mentionedUserId === mentionerId) return; // Don't notify self
  
  return createNotificationInternal(ctx, mentionedUserId, "mention", {
    promptId,
    commentId,
    fromUserId: mentionerId,
    fromUserName: mentionerName,
  });
}

// Notify prompt author when someone votes on their prompt
export async function notifyVote(
  ctx: any,
  promptId: string,
  voterId: string,
  voterName?: string,
  voteValue: number = 1
) {
  // Get prompt to find author
  const prompt = await ctx.db.get(promptId as any);
  if (!prompt || !("authorId" in prompt)) return;
  
  const authorId = (prompt as any).authorId;
  if (authorId === voterId) return; // Don't notify self
  
  return createNotificationInternal(ctx, authorId, "vote", {
    promptId,
    fromUserId: voterId,
    fromUserName: voterName,
    message: voteValue > 0 ? "voted up" : "voted down",
  });
}

// Notify user when invited to workspace
export async function notifyWorkspaceInvite(
  ctx: any,
  invitedUserId: string,
  workspaceId: string,
  inviterId: string,
  inviterName?: string
) {
  if (invitedUserId === inviterId) return; // Don't notify self
  
  return createNotificationInternal(ctx, invitedUserId, "invite", {
    workspaceId,
    fromUserId: inviterId,
    fromUserName: inviterName,
  });
}