```typescript
// Listarea 3.1: Accesarea parametrilor dinamici în Next.js 16
import { use } from "react";

export default function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const workspaceId = id as Id<"workspaces">;

  const workspace = useQuery(api.workspaces.getWorkspace, {
    workspaceId,
  });

  if (!workspace) return <div>Workspace-ul nu a fost găsit</div>;

  return (
    <div className="flex h-full">
      <WorkspaceSidebar workspaceId={workspaceId} />
      <main className="flex-1">
        <PromptEditor />
      </main>
    </div>
  );
}
```

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
      args.temperature ?? 0.7,
      args.maxTokens ?? 2048,
      apiKey.baseUrl
    );

    const testRunId = await ctx.runMutation(api.testRuns.saveResult, {
      promptId: args.promptId,
      configs: [{ provider: apiKey.provider, model: args.model }],
      results: [result],
    });

    return { runId: testRunId, result };
  },
});
```
