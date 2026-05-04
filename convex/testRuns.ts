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

async function callLLM(
  provider: string,
  secret: string,
  model: string,
  prompt: string,
  temperature?: number,
  maxTokens?: number,
  baseUrl?: string,
  extraSettings?: Record<string, any>
) {
  const start = Date.now();

  // LiteLLM proxy — unified OpenAI-compatible API for all providers
  if (provider === "litellm") {
    const url = baseUrl ? `${baseUrl.replace(/\/$/, "")}/chat/completions` : "http://localhost:4000/chat/completions";
    const body: any = {
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: temperature ?? 0.7,
      max_tokens: maxTokens ?? 2048,
    };
    if (extraSettings) {
      for (const [key, value] of Object.entries(extraSettings)) {
        if (value !== undefined && value !== null && value !== "") {
          body[key] = value;
        }
      }
    }
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`LiteLLM error: ${err}`);
    }
    const data = await res.json();
    return {
      provider: "litellm",
      model,
      response: data.choices?.[0]?.message?.content ?? "",
      latency: Date.now() - start,
    };
  }

  if (provider === "openai") {
    const body: any = {
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: temperature ?? 0.7,
      max_tokens: maxTokens ?? 2048,
    };
    if (extraSettings) {
      for (const [key, value] of Object.entries(extraSettings)) {
        if (value !== undefined && value !== null && value !== "") {
          body[key] = value;
        }
      }
    }
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI error: ${err}`);
    }
    const data = await res.json();
    return {
      provider,
      model,
      response: data.choices?.[0]?.message?.content ?? "",
      latency: Date.now() - start,
    };
  }

  if (provider === "anthropic") {
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
    return {
      provider,
      model,
      response: data.content?.[0]?.text ?? "",
      latency: Date.now() - start,
    };
  }

  if (provider === "ollama") {
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
    return {
      provider,
      model,
      response: data.response ?? "",
      latency: Date.now() - start,
    };
  }

  throw new Error(`Unsupported provider: ${provider}`);
}

export const runTest = mutation({
  args: {
    promptId: v.id("prompts"),
    keyId: v.id("apiKeys"),
    model: v.string(),
    temperature: v.optional(v.number()),
    maxTokens: v.optional(v.number()),
    testValues: v.optional(v.record(v.string(), v.string())),
    extraSettings: v.optional(v.record(v.string(), v.string())),
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

    // Find the current version of the prompt
    const currentVersion = await ctx.db
      .query("promptVersions")
      .withIndex("by_prompt_version", (q: any) =>
        q.eq("promptId", args.promptId).eq("version", prompt.currentVersion)
      )
      .first();

    if (!currentVersion) throw new Error("Current version not found");

    const content = substituteVars(prompt.content, args.testValues ?? {});
    const secret = decodeKey(key.encryptedKey);

    let result;
    try {
      const extra: Record<string, any> = {};
      if (args.extraSettings) {
        for (const [k, v] of Object.entries(args.extraSettings)) {
          if (v === "true" || v === "false") {
            extra[k] = v === "true";
          } else if (!isNaN(Number(v)) && v !== "") {
            extra[k] = Number(v);
          } else {
            extra[k] = v;
          }
        }
      }
      result = await callLLM(
        key.provider,
        secret,
        args.model,
        content,
        args.temperature,
        args.maxTokens,
        key.baseUrl ?? undefined,
        extra
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
      versionId: currentVersion._id,
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

    // Filter out old fabricated test runs that don't have a versionId
    const validRuns = runs.filter((r) => !!r.versionId);

    return validRuns.map((r) => ({
      _id: r._id,
      versionId: r.versionId,
      configs: r.configs,
      results: r.results,
      createdAt: r.createdAt,
    }));
  },
});

export const listVersionTestRuns = query({
  args: { versionId: v.id("promptVersions") },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const version = await ctx.db.get(args.versionId);
    if (!version) throw new Error("Version not found");

    const prompt = await ctx.db.get(version.promptId);
    if (!prompt) throw new Error("Prompt not found");

    const access = await getWorkspaceAccess(ctx, prompt.workspaceId, user._id.toString());
    if (!access) throw new Error("Access denied");

    const runs = await ctx.db
      .query("testRuns")
      .withIndex("by_version", (q) => q.eq("versionId", args.versionId))
      .order("desc")
      .collect();

    return runs.map((r) => ({
      _id: r._id,
      versionId: r.versionId,
      configs: r.configs,
      results: r.results,
      createdAt: r.createdAt,
    }));
  },
});

export const hasTestRuns = query({
  args: { versionId: v.id("promptVersions") },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const version = await ctx.db.get(args.versionId);
    if (!version) throw new Error("Version not found");

    const prompt = await ctx.db.get(version.promptId);
    if (!prompt) throw new Error("Prompt not found");

    const access = await getWorkspaceAccess(ctx, prompt.workspaceId, user._id.toString());
    if (!access) throw new Error("Access denied");

    const run = await ctx.db
      .query("testRuns")
      .withIndex("by_version", (q) => q.eq("versionId", args.versionId))
      .first();

    return !!run;
  },
});
