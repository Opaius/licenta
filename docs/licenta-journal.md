# Development Journal: Prompt Engineering Platform

## Licenta Project — Computer Science

---

## Chapter 1: Introduction and Project Context

### 1.1 Project Overview

This document chronicles the development of a collaborative prompt engineering platform — a web application designed to enable teams to create, version, test, and collaboratively refine AI prompts. The project was built using a modern full-stack architecture combining Next.js 16 for the frontend, Convex for the backend-as-a-service, and various UI frameworks including shadcn/ui and Monaco Editor for the prompt editing experience.

The journey from initial concept to functional prototype was not linear. Along the way, we encountered numerous technical challenges — some specific to the individual frameworks, others arising from the interaction between them. This journal documents those challenges, the solutions we developed, and the reasoning behind our architectural choices.

### 1.2 The Technology Stack

Before diving into the problems and solutions, it's essential to understand what tools we were working with:

**Frontend:**
- Next.js 16.2.4 (App Router with React 19)
- React 19 with TypeScript
- Tailwind CSS 4 for styling
- shadcn/ui component library
- Monaco Editor for the code/prompt editing experience
- Boneyard.js for component fixture generation

**Backend:**
- Convex (backend-as-a-service platform)
- better-auth for authentication
- Valibot and Zod for validation

**Development Tools:**
- Bun as package manager
- OpenCode with Kimi agent for AI-assisted development
- Git for version control

Each of these tools brought specific capabilities — and specific constraints that would shape our implementation.

---

## Chapter 2: The First Major Challenge — Next.js 16 params is Now a Promise

### 2.1 The Problem Emerges

One of the first significant errors we encountered came when accessing dynamic route parameters in Next.js. We had built a workspace page at `src/app/workspace/[id]/page.tsx` that was supposed to display prompts for a given workspace ID.

The error message was cryptic:

```
A param property was accessed directly with `params.id`. 
`params` is a Promise and must be unwrapped with `React.use()` 
before accessing its properties.
```

This was surprising because in previous versions of Next.js, `params` was a simple object. In Next.js 16, the App Router had changed — `params` is now delivered as a Promise that must be explicitly unwrapped.

### 2.2 Analyzing the Root Cause

The workspace page is a dynamic route using Next.js's App Router (folder-based routing). In Next.js 16, the framework changed how it handles dynamic parameters:

- **Previous behavior**: `params` was `{ id: string }`
- **New behavior**: `params` is `Promise<{ id: string }>`

This change reflects React 19's async handling capabilities, where components can be asynchronous and parameters may need to be awaited.

### 2.3 The Solution

The fix required two changes:

1. **Import the `use` hook from React:**
```typescript
import { useState, useEffect, use } from "react";
```

2. **Update the component to unwrap params:**
```typescript
export default function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const workspaceId = id as Id<"workspaces">;
  // ... rest of component
}
```

### 2.4 Lessons Learned

This was our first encounter with Next.js 16's breaking changes. The lesson: when working with a new framework version, always check the migration guides. The error message was actually quite helpful — it pointed us directly to the solution with a link to documentation.

**Coding Decision**: We decided to always explicitly type `params` as `Promise<{ ... }>` rather than relying on inference. This makes the contract clear and ensures TypeScript catches issues at compile time.

---

## Chapter 3: Convex Backend — The setTimeout Trap

### 3.1 The Test Runs Error

We had built a test running system that would execute prompts against different AI providers (OpenAI, Anthropic, Ollama). The user interface allowed selecting prompts and running them through multiple provider configurations.

When clicking the "Test" button, we received:

```
[CONVEX M(testRuns:runTest)] Server Error
Uncaught Error: Can't use setTimeout in queries and mutations. 
Please consider using an action.
```

### 3.2 Understanding Convex's Execution Model

Convex is different from traditional Node.js backends. Functions run in a restricted environment with specific constraints:

- **Queries**: Read-only functions that can be cached
- **Mutations**: Write operations that return data
- **Actions**: Side-effect functions that can perform async operations, including network calls

The key constraint: you cannot use `setTimeout` directly in Convex queries or mutations. The platform explicitly forbids this to ensure deterministic execution and proper caching.

### 3.3 The Original Problematic Code

In `convex/testRuns.ts`, we had implemented a mock delay function:

```typescript
async function callProvider(
  provider: Provider,
  model: string,
  prompt: string
): Promise<TestResult> {
  const start = Date.now();

  // THIS CAUSED THE ERROR - setTimeout is not allowed in Convex
  await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));

  const response = MOCK_RESPONSES[provider](prompt, model);

  return {
    provider,
    model,
    response,
    latency: Date.now() - start,
  };
}
```

### 3.4 The Solution

Since this was a mock implementation anyway (not making real API calls), we simply removed the artificial delay:

```typescript
async function callProvider(
  provider: Provider,
  model: string,
  prompt: string
): Promise<TestResult> {
  const start = Date.now();
  
  // Remove setTimeout - not allowed in Convex
  // The mock response is immediate
  const response = MOCK_RESPONSES[provider](prompt, model);

  return {
    provider,
    model,
    response,
    latency: Date.now() - start,
  };
}
```

### 3.5 When We Actually Need Delayed Operations

If we were building a real test runner that needed to wait for actual API responses, we would need to:

1. Use a **Convex Action** for the API call (actions can make network requests)
2. Use an external queue system for long-running operations
3. Implement webhooks for async execution

**Coding Decision**: For our prototype, we kept the mock responses but structured the code so it could be easily swapped for real API calls by moving to an action.

---

## Chapter 4: Authentication Challenges

### 4.1 The "Not Authenticated" Error

Another persistent issue was authentication. When queries like `api.prompts.listPrompts` were called, we'd get:

```
Server Error: Not authenticated
```

This originated from the `getUserIdOrThrow` function in `convex/prompts.ts`, which is called at the beginning of protected queries.

### 4.2 Authentication Architecture

We were using `@convex-dev/better-auth` for authentication integration. The Convex functions validate user identity at the start of operations:

```typescript
// From convex/prompts.ts
if (!user?.userId) throw new Error("Not authenticated");
```

This pattern ensures all data access is gated behind authentication. However, the error was occurring even when the user should have been logged in.

### 4.3 The Convex Auth Endpoint Issue

Sometimes the error was more severe:

```json
{"error":"Not Authorized: Run npx convex dev to login to your Convex project."}
```

This suggested the Convex deployment itself wasn't properly authenticated. The authentication token from `@convex-dev/better-auth` wasn't being recognized.

### 4.4 Troubleshooting Steps

When encountering auth issues, we found these steps helpful:

1. **Run `npx convex dev`** - Ensure local Convex instance is logged in
2. **Check Convex logs** - The deployment dashboard shows authentication events
3. **Verify session handling** - Ensure the frontend passes auth tokens correctly

### 4.5 The User Experience Impact

Authentication issues caused 503 errors in the UI, which then triggered Next.js development overlays with injected class names (see Chapter 5). This cascade of errors was initially confusing but taught us about error propagation in distributed systems.

**Architectural Decision**: We added a debug settings page (`/debug-settings`) to help diagnose auth issues and view the current authentication state during development.

---

## Chapter 5: Hydration Mismatches — The CSS Class Mystery

### 5.1 The Strange Class Name Errors

During development, we noticed hydration errors in the browser console:

```
Hydration failed because the initial UI does not match 
what was rendered on the server.

className="h-full antialiased" (server) vs 
className="h-full antialiased idc0_343 oqknntdc" (client)
```

The `<html>` element had different classes between server and client rendering. Extra class names (`idc0_343`, `oqknntdc`) appeared on the client but not the server.

### 5.2 Investigating Tailwind CSS 4

This project was built with Tailwind CSS 4. The key discovery was that Tailwind v4 uses `@import "tailwindcss"` syntax in CSS files rather than the traditional `@tailwind` directives:

```css
/* Tailwind v4 syntax in globals.css */
@import "tailwindcss";
```

Tailwind v4 has runtime behavior that generates class names dynamically. Some of these are generated at runtime to track CSS usage, which can differ between server (build time) and client (browser runtime).

### 5.3 Possible Sources of the Issue

We identified several potential causes:

1. **Tailwind v4 runtime classes** - The new version injects tracking classes
2. **Next.js Turbopack** - The development server has internal class handling
3. **Browser extensions** - Occasionally inject classes on the client side
4. **React Strict Mode** - Can cause double-rendering that computes classes differently

### 5.4 Mitigation Approaches

For production, these strategies help:

1. **Disable Strict Mode locally** - Remove in development if causing issues
2. **Static class names** - Avoid dynamic class composition when possible
3. **Accept minor hydration warnings** - Next.js can often recover at runtime
4. **Check Tailwind configuration** - Ensure v4 is properly configured

**Current Status**: This issue remains partially unresolved. It's a known interaction between Tailwind v4, Next.js 16's Turbopack, and React's hydration process. For a production system, further investigation into Tailwind v4 configuration options would be needed.

---

## Chapter 6: Form Handling — Felte Configuration

### 6.1 The Authentication Form Issues

We built an authentication page (`/auth`) with both login and signup forms using Felte for form state management. We encountered several configuration issues:

1. **Error display not working** - Validation errors weren't showing
2. **Shadcn integration** - We wanted to use shadcn components for error display
3. **Inconsistent API** - Confusion between `errors.field` and `errors().field`

### 6.2 Understanding Felte's Error API

Felte provides errors through a getter function, not direct property access:

```typescript
// WRONG - treats errors as an object
{loginErrors.email && (
  <p className="text-sm text-destructive">{loginErrors.email}</p>
)}

// CORRECT - errors is a getter function
{loginErrors().email && (
  <p className="text-sm text-destructive">{loginErrors().email}</p>
)}
```

### 6.3 The Fix

We updated the auth page to properly call the errors getter:

```typescript
// Login form errors
{loginErrors().email && (
  <p className="text-sm text-destructive">{loginErrors().email}</p>
)}
{loginErrors().password && (
  <p className="text-sm text-destructive">{loginErrors().password}</p>
)}

// Signup form errors  
{signupErrors().name && (
  <p className="text-sm text-destructive">{signupErrors().name}</p>
)}
{signupErrors().email && (
  <p className="text-sm text-destructive">{signupErrors().email}</p>
)}
{signupErrors().password && (
  <p className="text-sm text-destructive">{signupErrors().password}</p>
)}
```

### 6.4 Integration with shadcn/ui

We also wanted to integrate with shadcn's form components for better error display. This involved:

1. Using Felte's `createForm` to manage state
2. Connecting to shadcn's `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`
3. Using shadcn's `FormMessage` component for error display

**Architectural Decision**: We chose to keep a simpler error display initially (plain `<p>` tags with `text-destructive` class) rather than fully integrating shadcn forms, to reduce complexity. This is a trade-off between consistency and velocity.

---

## Chapter 7: Author Names — IDs Instead of Names

### 7.1 The Problem

In the workspace editor, version history and comments displayed user IDs (like "k5678...") instead of human-readable names:

```
author: { name: v.authorName ?? v.authorId } // Shows long ID if authorName undefined
```

### 7.2 Root Cause Analysis

Looking at the backend:

1. In `prompts.ts` - the author name was fetched but sometimes returned undefined
2. The fallback `getUserName` returns `user?.name ?? user?._id.toString().slice(0, 8) ?? "Unknown"`
3. If users don't have names set in better-auth, it displays sliced IDs
4. The frontend was directly using `authorName ?? authorId` which showed raw IDs

### 7.3 The Fixes

We made several adjustments:

1. **Frontend mapping**: Ensure the query properly maps author data
2. **Backend query adjustment**: Return user names properly from Convex queries
3. **Fallback display**: Show "Unknown" for missing names instead of IDs

**Current Status**: Partially addressed - the code has fallbacks but user profile names need to be set in better-auth.

---

## Chapter 8: Mock Data vs Real Convex Queries

### 8.1 The Sidebar Issue

The sidebar was displaying hardcoded mock workspaces instead of real data from Convex:

```typescript
// This was the initial implementation with DEMO data
const DEMO_WORKSPACES: WorkspaceItem[] = [
  { id: "demo-workspace", name: "My Prompts", prompts: [...] },
  { id: "shared-workspace", name: "Team Prompts", prompts: [...] },
];
```

### 8.2 The Fix

Update the Sidebar component to query real Convex data:

```typescript
const workspace = useQuery(api.workspaces.getWorkspace, { workspaceId });
const allWorkspaces = useQuery(api.workspaces.listWorkspaces, {});
const prompts = useQuery(api.prompts.listPrompts, { workspaceId });

// Map to sidebar format
const sidebarWorkspaces: WorkspaceItem[] = (allWorkspaces ?? []).map((ws) => ({
  id: ws._id,
  name: ws.name,
  prompts: ws._id === workspaceId ? (prompts ?? []).map((p) => ({
    id: p._id,
    name: p.title,
    updatedAt: new Date(p.createdAt),
  })) : [],
}));
```

### 8.3 Trade-offs

- **Demo data**: Useful for boneyard fixture capture (static screenshots)
- **Real data**: Required for actual functionality
- **Solution**: Use demo data as fixtures, real data in production

---

## Chapter 9: Testing State and UI Updates

### 9.1 Testing State Not Resetting

Issue: When running tests, the UI state didn't always reset properly:

```typescript
const handleTest = async () => {
  if (!selectedPromptId) return;
  setTesting(true);  // Set loading state
  try {
    await runTestMutation({...});
  } catch (err) {
    console.error(err);
  } finally {
    setTesting(false);  // Reset in finally to ensure cleanup
  }
};
```

### 9.2 Test Results Empty State

When no test runs existed, the UI didn't handle the empty state correctly. Added proper handling:

```typescript
useEffect(() => {
  if (testRuns?.length) {
    const latestRun = testRuns[0];
    const mapped: TestResult[] = (latestRun.results || []).map((r, idx) => ({
      // ... map results
    }));
    setTestResults(mapped);
  } else {
    setTestResults([]);  // Handle empty case
  }
}, [testRuns]);
```

---

## Chapter 10: Editor Implementation — Monaco and Resizable Panels

### 7.1 The Prompt Editor Requirements

We needed a sophisticated editor for prompts that supported:

1. **Syntax highlighting** for template variables (`{{variable}}`)
2. **Resizable panels** — users should be able to adjust editor size
3. **Markdown support** with strict inputs for JSON schema parameters
4. **Monaco Editor** integration (same editor as VS Code)

### 7.2 Custom Monaco Language

We created a custom language definition for "prompt-template" that highlights template variables:

```typescript
const registerPromptLanguage = (monaco: typeof import("monaco-editor")) => {
  // Register custom language
  monaco.languages.register({ id: "prompt-template" });

  // Tokenizer for template variables {{variable}}
  monaco.languages.setMonarchTokensProvider("prompt-template", {
    tokenizer: {
      root: [
        // Template variables {{variable}}
        [/\{\{[^}]+\}\}/, "template-variable"],
        // Strings, comments, numbers, keywords...
      ],
    },
  });

  // Define themes (light and dark)
  monaco.editor.defineTheme("prompt-theme", { ... });
  monaco.editor.defineTheme("prompt-theme-dark", { ... });

  // Auto-completion for common template variables
  monaco.languages.registerCompletionItemProvider("prompt-template", {
    provideCompletionItems: (model, position) => { ... }
  });
};
```

### 7.3 Resizable Panel Layout

We used shadcn's `ResizablePanelGroup` to create a flexible layout:

```typescript
<ResizablePanelGroup direction="horizontal" className="flex flex-1 min-w-0 overflow-hidden">
  {/* Editor + Test Results */}
  <ResizablePanel defaultSize={80} minSize={50}>
    <PromptEditor ... />
    <TestResultsPanel ... />
  </ResizablePanel>

  <ResizableHandle withHandle ... />

  {/* Right panel: Versions / Comments / Voting */}
  <ResizablePanel minSize={20} maxSize={50} defaultSize={20}>
    <Tabs ... />
  </ResizablePanel>
</ResizablePanelGroup>
```

### 7.4 Configuration Trade-offs

A few configuration decisions we made:

1. **Default editor size at 80%** — Gives users room to start, can resize up
2. **Right panel 20% default, 20-50% range** — Enough for tabs but not overwhelming
3. **Monaco dark theme** — Matches our dark-only theme requirement
4. **Custom template language** — More useful than generic markdown for prompt editing

---

## Chapter 9: Version/Voting Schema Migration

### 9.1 The Migration Error

Testing revealed that old data in the database had fields no longer in the schema:

- Old `votes` had `promptId` (new schema doesn't)
- Old `testRuns` had fabricated test data
- Schema migration might fail if `versionId` was required in old documents

### 9.2 The Fix

Made certain fields optional in schema for backward compatibility, and noted old data should be cleared:

```typescript
// Made versionId optional for backward compatibility
v.optional(v.id("promptVersions")),
```

---

## Chapter 10: UX/UI Polish — Frequently Overlooked Issues

### 10.1 Common UI Issues

During development, we addressed common UX issues:

1. **Icon sizing** - Use fixed viewBox (24x24) with consistent w-6 h-6 classes
2. **Content padding** - Account for fixed navbar height
3. **z-index issues** - Proper layering for modals and dropdowns

### 10.2 Implementation

The project follows these conventions:
- All Lucide icons use 24x24 viewBox
- Navbar has fixed height with content padding
- Dropdowns have proper z-index positioning

---

## Chapter 11: Development Tools — The Story of AI Assistance

### 8.1 The Data Model

We implemented a relational schema with these primary entities:

| Table | Purpose |
|-------|---------|
| `workspaces` | Container for prompts, owned by users |
| `workspaceMembers` | Access control (owner, editor, viewer roles) |
| `prompts` | The actual prompt content with versions |
| `promptVersions` | Version history for prompts |
| `comments` | Line-level comments on prompts |
| `votes` | Upvote/downvote system |
| `testRuns` | Test execution results |
| `apiKeys` | User-provided API keys (BYOK) |
| `notifications` | User notifications |

### 8.2 Query Pattern: The "skip" Pattern

For optional queries, we used Convex's "skip" pattern to avoid unnecessary database calls:

```typescript
const promptDetail = useQuery(
  api.prompts.getPrompt,
  selectedPromptId ? { promptId: selectedPromptId } : "skip"
);
```

This tells Convex "don't execute this query if the ID is falsy, just return undefined." This is more efficient than passing null or checking in the mutation.

### 8.3 Access Control Pattern

Each function followed a consistent access pattern:

```typescript
export const getPrompt = query({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const prompt = await ctx.db.get(args.promptId);
    if (!prompt) throw new Error("Prompt not found");

    const access = await getWorkspaceAccess(ctx, prompt.workspaceId, user._id.toString());
    if (!access) throw new Error("Access denied");

    return prompt;
  },
});
```

---

## Chapter 9: Development Tools — The Story of AI Assistance

### 9.1 OpenCode and the Kimi Agent

This project was developed with significant AI assistance through OpenCode, an interactive CLI tool for software engineering. The key agent was "kimik2.6" — an AI model specifically configured for this project.

The interaction pattern was:
1. User describes a task or problem in Discord
2. OpenCode receives the message, starts a session
3. Kimi agent explores the codebase, reads relevant files
4. Agent implements fixes or new features
5. Results are shared back via Discord with diff URLs

### 9.2 Session Types

We had several categories of sessions:

- **Build sessions**: Implementation work (default)
- **Explore sessions**: Understanding codebase structure
- **Librarian sessions**: Researching documentation and patterns
- **Sisyphus-Junior**: Sub-agent for specific features

### 9.3 Critique for Code Review

The `critique` tool was invaluable for:
- Generating shareable diff URLs for review
- Showing what changed in each session
- Enabling async code review through Discord sharing

Example workflow:
```bash
bunx critique --web "Fix params Promise unwrap in workspace page" \
  --filter "src/app/workspace/[id]/page.tsx"
```

### 9.4 Development Workflow

The actual development flow was:

1. **Start dev server** with tunnel access for Discord collaboration:
```bash
bunx tuistory launch "kimaki tunnel -p 3000 -- pnpm dev" -s myapp-dev
```

2. **Write code** with TypeScript, React, and Convex

3. **Run typecheck/lint** to catch errors:
```bash
bun run typecheck  # or similar
```

4. **Review changes** with critique before committing

---

## Chapter 10: Summary of Technical Decisions

### 10.1 Architecture Decisions

| Decision | Rationale |
|----------|----------|
| Next.js App Router | Modern React 19 support, server components |
| Convex backend | Real-time sync, simple deployment |
| Dark theme only | Simpler codebase, aesthetic choice |
| shadcn/ui | Accessible, customizable components |
| Monaco Editor | Industry-standard editor experience |
| Zod + Valibot | Validation (Zod runtime, Valibot forms) |
| better-auth | Integrated auth with Convex |

### 10.2 Fixes Applied

| Issue | Solution |
|-------|----------|
| Next.js params Promise | Use `React.use(params)` |
| Convex setTimeout | Remove artificial delay / use actions |
| Auth errors | Re-run `npx convex dev` |
| Hydration mismatch | Partial - Tailwind v4 runtime |
| Felte errors | Call errors as `errors()` getter |

### 10.3 Remaining Issues

1. **Hydration mismatch** — Tailwind v4 / Next.js 16 interaction
2. **Convex auth intermittent** — May need re-authentication flow
3. **BYOK integration** — API key management needs production hardening

---

## Chapter 11: Conclusion and Reflections

### 11.1 What We Learned

This project was a deep dive into modern web development challenges:

1. **Framework integration** — Next.js 16, React 19, Convex, Tailwind v4 all interact in complex ways
2. **AI-assisted development** — Tools like OpenCode accelerate development but require careful prompt engineering
3. **Real-time collaboration** — Convex provides excellent real-time features but requires understanding its execution model

### 11.2 Future Work

Areas that would benefit from further development:

1. **Production API integration** — Currently using mocks; real provider integration via Convex actions
2. **More sophisticated test runner** — Multi-step tests, assertjions, CI integration
3. **Team collaboration** — Real-time cursors, presence indicators
4. **Public gallery** — Share prompts publicly with attribution
5. **Analytics** — Prompt performance tracking over time

### 11.3 Final Thoughts

Building a collaborative prompt engineering platform is inherently multi-disciplinary — it requires knowledge of AI, web development, real-time systems, and user experience. This journal captures not just the technical solutions but the reasoning behind them.

The bugs we encountered were as valuable as the features we built. Each error taught us something about the tools we chose and the platform we were building on.

---

## Appendix A: File Structure

```
/home/cioky/.kimaki/projects/licenta/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/               # Authentication page
│   │   ├── dashboard/         # Dashboard
│   │   ├── workspace/[id]/    # Workspace editor
│   │   └── debug-settings/   # Debug page
│   ├── components/
│   │   ├── editor/           # Prompt editor components
│   │   └── ui/               # shadcn components
│   └── lib/                  # Utilities
├── convex/                    # Convex backend functions
│   ├── auth.ts
│   ├── prompts.ts
│   ├── testRuns.ts
│   └── ...
└── docs/                     # Documentation
    └── licenta-journal.md     # This document
```

## Appendix B: Key Dependencies

```json
{
  "next": "16.2.4",
  "react": "^19.0.0",
  "convex": "^latest",
  "@convex-dev/better-auth": "^latest",
  "tailwindcss": "^4.0.0",
  "@monaco-editor/react": "^latest",
  "shadcn": "latest",
  "valibot": "^latest",
  "zod": "^latest",
  "felte": "^latest",
  "boneyard-js": "^latest"
}
```

---

*Document prepared for Licenta — Computer Science*
*Project: Collaborative Prompt Engineering Platform*
*Author: [Author Name]*
*Date: April 2026*