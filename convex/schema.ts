import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Better-Auth manages users table automatically

  workspaces: defineTable({
    name: v.string(),
    ownerId: v.string(),
    isPublic: v.boolean(),
    createdAt: v.number(),
  }).index("by_owner", ["ownerId"]),

  workspaceMembers: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.string(),
    role: v.union(v.literal("owner"), v.literal("editor"), v.literal("viewer")),
    joinedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_user", ["userId"]),

  invites: defineTable({
    workspaceId: v.id("workspaces"),
    code: v.string(),
    creatorId: v.string(),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_code", ["code"]),

  prompts: defineTable({
    workspaceId: v.id("workspaces"),
    title: v.string(),
    content: v.string(),
    templateVars: v.optional(v.array(v.string())),
    createdAt: v.number(),
    authorId: v.string(),
    currentVersion: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_author", ["authorId"]),

  promptVersions: defineTable({
    promptId: v.id("prompts"),
    content: v.string(),
    version: v.number(),
    createdAt: v.number(),
    authorId: v.string(),
  })
    .index("by_prompt", ["promptId"])
    .index("by_prompt_version", ["promptId", "version"]),

  promptBranches: defineTable({
    promptId: v.id("prompts"),
    name: v.string(),
    baseVersion: v.number(),
    createdAt: v.number(),
  }).index("by_prompt", ["promptId"]),

  votes: defineTable({
    promptId: v.id("prompts"),
    userId: v.string(),
    value: v.union(v.literal(1), v.literal(-1)),
    createdAt: v.number(),
  })
    .index("by_prompt", ["promptId"])
    .index("by_user_prompt", ["userId", "promptId"]),

  comments: defineTable({
    promptId: v.id("prompts"),
    versionId: v.optional(v.id("promptVersions")),
    content: v.string(),
    selectionStart: v.optional(v.number()),
    selectionEnd: v.optional(v.number()),
    authorId: v.string(),
    resolved: v.boolean(),
    parentId: v.optional(v.id("comments")),
    createdAt: v.number(),
  })
    .index("by_prompt", ["promptId"])
    .index("by_parent", ["parentId"]),

  apiKeys: defineTable({
    workspaceId: v.id("workspaces"),
    provider: v.union(v.literal("openai"), v.literal("anthropic"), v.literal("ollama")),
    // Encrypted key - in production use proper encryption
    encryptedKey: v.string(),
    label: v.string(),
    createdAt: v.number(),
  }).index("by_workspace", ["workspaceId"]),

  testRuns: defineTable({
    promptId: v.id("prompts"),
    configs: v.array(
      v.object({
        provider: v.string(),
        model: v.string(),
        temperature: v.optional(v.number()),
        topP: v.optional(v.number()),
        maxTokens: v.optional(v.number()),
      })
    ),
    results: v.optional(
      v.array(
        v.object({
          provider: v.string(),
          model: v.string(),
          response: v.string(),
          latency: v.number(),
          error: v.optional(v.string()),
        })
      )
    ),
    createdAt: v.number(),
  }).index("by_prompt", ["promptId"]),

  notifications: defineTable({
    userId: v.string(),
    type: v.union(
      v.literal("mention"),
      v.literal("comment"),
      v.literal("vote"),
      v.literal("share")
    ),
    data: v.string(), // JSON stringified
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "read"]),
});
