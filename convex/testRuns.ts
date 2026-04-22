import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUser } from "./auth";

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

function substituteVars(content: string, values: Record<string, string>): string {
  return content.replace(/\{\{(\w+)(?:\s*\|\s*[^}]+)?\}\}/g, (_, name) => {
    return values[name] ?? `{{${name}}}`;
  });
}

async function callOpenAI(secret: string, model: string, prompt: string, temperature?: number, maxTokens?: number) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: temperature ?? 0.7,
      max_tokens: maxTokens ?? 2048,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error: ${err}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function callAnthropic(secret: string, model: string, prompt: string, temperature?: number, maxTokens?: number) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": secret,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens ?? 2048,
      temperature: temperature ?? 0.7,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic error: ${err}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}

async function callOllama(model: string, prompt: string, temperature?: number) {
  const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: { temperature: temperature ?? 0.7 },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ollama error: ${err}`);
  }
  const data = await res.json();
  return data.response ?? "";
}

async function callProvider(
  provider: string,
  secret: string,
  model: string,
  prompt: string,
  temperature?: number,
  maxTokens?: number
) {
  const start = Date.now();
  let response = "";

  if (provider === "openai") {
    response = await callOpenAI(secret, model, prompt, temperature, maxTokens);
  } else if (provider === "anthropic") {
    response = await callAnthropic(secret, model, prompt, temperature, maxTokens);
  } else if (provider === "ollama") {
    response = await callOllama(model, prompt, temperature);
  } else {
    throw new Error(`Unsupported provider: ${provider}`);
  }

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
    keyId: v.id("apiKeys"),
    model: v.string(),
    temperature: v.optional(v.number()),
    maxTokens: v.optional(v.number()),
    testValues: v.optional(v.record(v.string(), v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const prompt = await ctx.db.get(args.promptId);
    if (!prompt) throw new Error("Prompt not found");

    const key = await ctx.db.get(args.keyId);
    if (!key) throw new Error("API key not found");

    const access = await getWorkspaceAccess(ctx, prompt.workspaceId, user._id.toString());
    if (!access || access === "viewer") {
      throw new Error("Access denied");
    }

    const content = substituteVars(prompt.content, args.testValues ?? {});
    const secret = decodeKey(key.encryptedKey);

    let result;
    try {
      result = await callProvider(
        key.provider,
        secret,
        args.model,
        content,
        args.temperature,
        args.maxTokens
      );
    } catch (e) {
      result = {
        provider: key.provider,
        model: args.model,
        response: "",
        latency: 0,
        error: e instanceof Error ? e.message : "Unknown error",
      };
    }

    const runId = await ctx.db.insert("testRuns", {
      promptId: args.promptId,
      configs: [{ provider: key.provider, model: args.model, temperature: args.temperature, maxTokens: args.maxTokens }],
      results: [result],
      createdAt: Date.now(),
    });

    return { runId, result };
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

    const access = await getWorkspaceAccess(ctx, prompt.workspaceId, user._id.toString());
    if (!access) throw new Error("Access denied");

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

    const access = await getWorkspaceAccess(ctx, prompt.workspaceId, user._id.toString());
    if (!access) throw new Error("Access denied");

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
