import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUser, getUserName, resolveAuthorNames } from "./auth";

function extractTemplateVars(content: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const vars = new Set<string>();
  let match;
  while ((match = regex.exec(content)) !== null) {
    vars.add(match[1]);
  }
  return Array.from(vars);
}

function countChanges(oldContent: string, newContent: string): number {
  const oldLines = oldContent.split("\n");
  const newLines = newContent.split("\n");
  let changes = 0;
  const maxLen = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < maxLen; i++) {
    if (oldLines[i] !== newLines[i]) changes++;
  }
  return changes;
}

async function getUserIdOrThrow(ctx: any): Promise<string> {
  const user = await getUser(ctx);
  if (!user?._id) throw new Error("Not authenticated");
  return user._id.toString();
}

async function getWorkspaceAccess(
  ctx: any,
  workspaceId: any,
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

async function requireWriteAccess(
  ctx: any,
  workspaceId: any,
  userId: string
): Promise<string> {
  const access = await getWorkspaceAccess(ctx, workspaceId, userId);
  if (!access || access === "viewer") {
    throw new Error("Write access required");
  }
  return userId;
}

export const listPrompts = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await getUserIdOrThrow(ctx);

    const access = await getWorkspaceAccess(ctx, args.workspaceId, userId);
    if (!access) throw new Error("Access denied");

    const prompts = await ctx.db
      .query("prompts")
      .withIndex("by_workspace", (q: any) =>
        q.eq("workspaceId", args.workspaceId)
      )
      .collect();

    return prompts.map((prompt) => ({
      _id: prompt._id,
      _creationTime: prompt._creationTime,
      workspaceId: prompt.workspaceId,
      title: prompt.title,
      content: prompt.content,
      templateVars: prompt.templateVars,
      createdAt: prompt.createdAt,
      authorId: prompt.authorId,
      currentVersion: prompt.currentVersion,
      hasContent: prompt.content.length > 0,
    }));
  },
});

export const createPrompt = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserIdOrThrow(ctx);
    await requireWriteAccess(ctx, args.workspaceId, userId);

    const templateVars = extractTemplateVars(args.content);
    const now = Date.now();

    const authorName = await getUserName(ctx);

    const promptId = await ctx.db.insert("prompts", {
      workspaceId: args.workspaceId,
      title: args.title,
      content: args.content,
      templateVars,
      createdAt: now,
      authorId: userId,
      currentVersion: 1,
    });

    await ctx.db.insert("promptVersions", {
      promptId,
      content: args.content,
      version: 1,
      changes: 0,
      createdAt: now,
      authorId: userId,
      authorName,
    });

    return { promptId, version: 1 };
  },
});

export const updatePrompt = mutation({
  args: {
    promptId: v.id("prompts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserIdOrThrow(ctx);
    const authorName = await getUserName(ctx);
    const prompt = await ctx.db.get(args.promptId);
    if (!prompt) throw new Error("Prompt not found");

    await requireWriteAccess(ctx, prompt.workspaceId, userId);

    const templateVars = extractTemplateVars(args.content);
    const newVersion = prompt.currentVersion + 1;
    const now = Date.now();

    const prevVersion = await ctx.db
      .query("promptVersions")
      .withIndex("by_prompt_version", (q: any) =>
        q.eq("promptId", args.promptId).eq("version", prompt.currentVersion)
      )
      .first();

    const changes = prevVersion
      ? countChanges(prevVersion.content, args.content)
      : args.content.length;

    await ctx.db.patch(args.promptId, {
      content: args.content,
      templateVars,
      currentVersion: newVersion,
    });

    await ctx.db.insert("promptVersions", {
      promptId: args.promptId,
      content: args.content,
      version: newVersion,
      changes,
      createdAt: now,
      authorId: userId,
      authorName,
    });

    return { version: newVersion };
  },
});

export const updatePromptTitle = mutation({
  args: {
    promptId: v.id("prompts"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserIdOrThrow(ctx);
    const prompt = await ctx.db.get(args.promptId);
    if (!prompt) throw new Error("Prompt not found");

    await requireWriteAccess(ctx, prompt.workspaceId, userId);

    if (!args.title || args.title.trim().length === 0) {
      throw new Error("Prompt title cannot be empty");
    }
    if (args.title.length > 200) {
      throw new Error("Prompt title must be 200 characters or less");
    }

    await ctx.db.patch(args.promptId, {
      title: args.title.trim(),
    });

    return { success: true };
  },
});

export const getPrompt = query({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, args) => {
    const userId = await getUserIdOrThrow(ctx);

    const prompt = await ctx.db.get(args.promptId);
    if (!prompt) throw new Error("Prompt not found");

    const access = await getWorkspaceAccess(ctx, prompt.workspaceId, userId);
    if (!access) throw new Error("Access denied");

    const latestVersion = await ctx.db
      .query("promptVersions")
      .withIndex("by_prompt_version", (q: any) =>
        q.eq("promptId", args.promptId).eq("version", prompt.currentVersion)
      )
      .first();

    return {
      _id: prompt._id,
      _creationTime: prompt._creationTime,
      workspaceId: prompt.workspaceId,
      title: prompt.title,
      content: prompt.content,
      templateVars: prompt.templateVars,
      createdAt: prompt.createdAt,
      authorId: prompt.authorId,
      currentVersion: prompt.currentVersion,
      versionContent: latestVersion?.content ?? prompt.content,
      latestVersionCreatedAt: latestVersion?.createdAt,
    };
  },
});

export const getPromptVersions = query({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, args) => {
    const userId = await getUserIdOrThrow(ctx);

    const prompt = await ctx.db.get(args.promptId);
    if (!prompt) throw new Error("Prompt not found");

    const access = await getWorkspaceAccess(ctx, prompt.workspaceId, userId);
    if (!access) throw new Error("Access denied");

    const versions = await ctx.db
      .query("promptVersions")
      .withIndex("by_prompt", (q: any) => q.eq("promptId", args.promptId))
      .order("desc")
      .collect();

    const authorIds = versions.map((v) => v.authorId);
    const nameMap = await resolveAuthorNames(ctx, authorIds);

    return versions.map((v) => ({
      _id: v._id,
      _creationTime: v._creationTime,
      promptId: v.promptId,
      content: v.content,
      version: v.version,
      changes: v.changes,
      createdAt: v.createdAt,
      authorId: v.authorId,
      authorName: v.authorName ?? nameMap.get(v.authorId) ?? "Unknown",
    }));
  },
});

export const restoreVersion = mutation({
  args: {
    promptId: v.id("prompts"),
    versionId: v.id("promptVersions"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserIdOrThrow(ctx);
    const authorName = await getUserName(ctx);
    const prompt = await ctx.db.get(args.promptId);
    if (!prompt) throw new Error("Prompt not found");

    await requireWriteAccess(ctx, prompt.workspaceId, userId);

    const targetVersion = await ctx.db.get(args.versionId);
    if (!targetVersion) throw new Error("Version not found");
    if (targetVersion.promptId !== args.promptId) {
      throw new Error("Version does not belong to this prompt");
    }

    const templateVars = extractTemplateVars(targetVersion.content);
    const newVersion = prompt.currentVersion + 1;
    const now = Date.now();

    const prevVersion = await ctx.db
      .query("promptVersions")
      .withIndex("by_prompt_version", (q: any) =>
        q.eq("promptId", args.promptId).eq("version", prompt.currentVersion)
      )
      .first();

    const changes = prevVersion
      ? countChanges(prevVersion.content, targetVersion.content)
      : targetVersion.content.length;

    await ctx.db.patch(args.promptId, {
      content: targetVersion.content,
      templateVars,
      currentVersion: newVersion,
    });

    await ctx.db.insert("promptVersions", {
      promptId: args.promptId,
      content: targetVersion.content,
      version: newVersion,
      changes,
      createdAt: now,
      authorId: userId,
      authorName,
    });

    return { version: newVersion };
  },
});

export const createBranch = mutation({
  args: {
    promptId: v.id("prompts"),
    name: v.string(),
    versionId: v.optional(v.id("promptVersions")),
  },
  handler: async (ctx, args) => {
    const userId = await getUserIdOrThrow(ctx);
    const prompt = await ctx.db.get(args.promptId);
    if (!prompt) throw new Error("Prompt not found");

    await requireWriteAccess(ctx, prompt.workspaceId, userId);

    let baseVersion = prompt.currentVersion;

    if (args.versionId) {
      const version = await ctx.db.get(args.versionId);
      if (!version) throw new Error("Version not found");
      if (version.promptId !== args.promptId) {
        throw new Error("Version does not belong to this prompt");
      }
      baseVersion = version.version;
    }

    const branchId = await ctx.db.insert("promptBranches", {
      promptId: args.promptId,
      name: args.name,
      baseVersion,
      createdAt: Date.now(),
    });

    return { branchId, baseVersion };
  },
});

export const getBranches = query({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, args) => {
    const userId = await getUserIdOrThrow(ctx);

    const prompt = await ctx.db.get(args.promptId);
    if (!prompt) throw new Error("Prompt not found");

    const access = await getWorkspaceAccess(ctx, prompt.workspaceId, userId);
    if (!access) throw new Error("Access denied");

    const branches = await ctx.db
      .query("promptBranches")
      .withIndex("by_prompt", (q: any) => q.eq("promptId", args.promptId))
      .collect();

    return branches.map((b) => ({
      _id: b._id,
      _creationTime: b._creationTime,
      promptId: b.promptId,
      name: b.name,
      baseVersion: b.baseVersion,
      createdAt: b.createdAt,
    }));
  },
});

export const mergeBranch = mutation({
  args: {
    promptId: v.id("prompts"),
    branchId: v.id("promptBranches"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserIdOrThrow(ctx);
    const authorName = await getUserName(ctx);
    const prompt = await ctx.db.get(args.promptId);
    if (!prompt) throw new Error("Prompt not found");

    await requireWriteAccess(ctx, prompt.workspaceId, userId);

    const branch = await ctx.db.get(args.branchId);
    if (!branch) throw new Error("Branch not found");
    if (branch.promptId !== args.promptId) {
      throw new Error("Branch does not belong to this prompt");
    }

    const templateVars = extractTemplateVars(args.content);
    const newVersion = prompt.currentVersion + 1;
    const now = Date.now();

    const prevVersion = await ctx.db
      .query("promptVersions")
      .withIndex("by_prompt_version", (q: any) =>
        q.eq("promptId", args.promptId).eq("version", prompt.currentVersion)
      )
      .first();

    const changes = prevVersion
      ? countChanges(prevVersion.content, args.content)
      : args.content.length;

    await ctx.db.patch(args.promptId, {
      content: args.content,
      templateVars,
      currentVersion: newVersion,
    });

    await ctx.db.insert("promptVersions", {
      promptId: args.promptId,
      content: args.content,
      version: newVersion,
      changes,
      createdAt: now,
      authorId: userId,
      authorName,
    });

    await ctx.db.delete(args.branchId);

    return { version: newVersion };
  },
});

export const deletePrompt = mutation({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, args) => {
    const userId = await getUserIdOrThrow(ctx);
    const prompt = await ctx.db.get(args.promptId);
    if (!prompt) throw new Error("Prompt not found");

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .filter((q: any) => q.eq(q.field("workspaceId"), prompt.workspaceId))
      .first();

    if (!membership || membership.role !== "owner") {
      throw new Error("Only workspace owner can delete prompts");
    }

    const versions = await ctx.db
      .query("promptVersions")
      .withIndex("by_prompt", (q: any) => q.eq("promptId", args.promptId))
      .collect();

    for (const v of versions) {
      await ctx.db.delete(v._id);
    }

    const branches = await ctx.db
      .query("promptBranches")
      .withIndex("by_prompt", (q: any) => q.eq("promptId", args.promptId))
      .collect();

    for (const b of branches) {
      await ctx.db.delete(b._id);
    }

    await ctx.db.delete(args.promptId);

    return { success: true };
  },
});