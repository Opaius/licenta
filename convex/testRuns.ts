import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUser } from "./auth";

type Provider = "openai" | "anthropic" | "ollama";

type TestConfig = {
  provider: Provider;
  model: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
};

type TestResult = {
  provider: string;
  model: string;
  response: string;
  latency: number;
  error?: string;
};

const MOCK_RESPONSES: Record<Provider, (prompt: string, model: string) => string> = {
  openai: (prompt, model) => `[OpenAI/${model}] Processed: "${prompt.slice(0, 50)}..."`,
  anthropic: (prompt, model) => `[Anthropic/${model}] Analyzed: "${prompt.slice(0, 50)}..."`,
  ollama: (prompt, model) => `[Ollama/${model}] Local response to: "${prompt.slice(0, 50)}..."`,
};

async function callProvider(
  provider: Provider,
  model: string,
  prompt: string
): Promise<TestResult> {
  const start = Date.now();

  await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));

  const response = MOCK_RESPONSES[provider](prompt, model);

  return {
    provider,
    model,
    response,
    latency: Date.now() - start,
  };
}

export const runTest = mutation({
  args: {
    promptId: v.id("prompts"),
    configs: v.array(
      v.object({
        provider: v.union(v.literal("openai"), v.literal("anthropic"), v.literal("ollama")),
        model: v.string(),
        temperature: v.optional(v.number()),
        topP: v.optional(v.number()),
        maxTokens: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const prompt = await ctx.db.get(args.promptId);
    if (!prompt) throw new Error("Prompt not found");

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("workspaceId"), prompt.workspaceId))
      .first();

    if (!membership || membership.role === "viewer") {
      throw new Error("Access denied");
    }

    const results: TestResult[] = [];
    for (const config of args.configs) {
      try {
        const result = await callProvider(config.provider, config.model, prompt.content);
        results.push(result);
      } catch (e) {
        results.push({
          provider: config.provider,
          model: config.model,
          response: "",
          latency: 0,
          error: e instanceof Error ? e.message : "Unknown error",
        });
      }
    }

    const runId = await ctx.db.insert("testRuns", {
      promptId: args.promptId,
      configs: args.configs,
      results,
      createdAt: Date.now(),
    });

    return runId;
  },
});

export const getTestRun = query({
  args: { runId: v.id("testRuns") },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const run = await ctx.db.get(args.runId);
    if (!run) throw new Error("Test run not found");

    const prompt = await ctx.db.get(run.promptId);
    if (!prompt) throw new Error("Prompt not found");

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("workspaceId"), prompt.workspaceId))
      .first();

    if (!membership) throw new Error("Access denied");

    return run;
  },
});

export const listTestRuns = query({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const prompt = await ctx.db.get(args.promptId);
    if (!prompt) throw new Error("Prompt not found");

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("workspaceId"), prompt.workspaceId))
      .first();

    if (!membership) throw new Error("Access denied");

    const runs = await ctx.db
      .query("testRuns")
      .withIndex("by_prompt", (q) => q.eq("promptId", args.promptId))
      .order("desc")
      .collect();

    return runs.map((r) => ({
      _id: r._id,
      configs: r.configs,
      results: r.results,
      createdAt: r.createdAt,
    }));
  },
});