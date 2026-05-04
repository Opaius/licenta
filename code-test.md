---
title: Code Test
---

## Test TypeScript

Mai jos este codul pentru accesarea parametrilor dinamici în Next.js 16:

```typescript
// Listarea 3.1: Accesarea parametrilor dinamici în Next.js 16
import { use } from "react";

export default function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params); // params este Promise, nu obiect
  const workspaceId = id as Id<"workspaces">;

  const workspace = useQuery(api.workspaces.getWorkspace, {
    workspaceId,
  });

  const prompts = useQuery(api.prompts.listPrompts, {
    workspaceId,
  });

  if (!workspace) return <div>Workspace-ul nu a fost găsit</div>;

  return (
    <div className="flex h-full">
      <WorkspaceSidebar workspaceId={workspaceId} />
      <main className="flex-1">
        <PromptEditor prompts={prompts ?? []} />
      </main>
    </div>
  );
}
```

Și codul pentru apelul API extern prin Convex action:

```typescript
// Listarea 3.2: Apelul API extern prin Convex action
export const runTest = action({
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

    const apiKey = await ctx.runQuery(api.apiKeys.getApiKey, {
      keyId: args.keyId,
    });

    const prompt = await ctx.runQuery(api.prompts.getPrompt, {
      promptId: args.promptId,
    });

    const content = substituteVars(
      prompt.content,
      args.testValues ?? {}
    );

    const result = await callLLM(
      apiKey.provider,
      apiKey.secret,
      args.model,
      content,
      args.temperature,
      args.maxTokens,
      apiKey.baseUrl
    );

    await ctx.runMutation(api.testRuns.saveResult, {
      promptId: args.promptId,
      result,
    });

    return { success: true, result };
  },
});
```
