# Development Journal: Collaborative Prompt Engineering Platform

## Licenta — Computer Science Project

---

## Introduction

This document chronicles my journey building a collaborative prompt engineering platform — a web application that enables teams to create, version, test, and refine AI prompts together. I started with only a vague idea of what I wanted and gradually built out the application through many iterations, debugging sessions, and learning experiences.

I should mention upfront that I used AI asistencia tools during development. However, I made every architectural decision myself, debugged every issue personally, and learned a great deal about modern web development through the challenges I faced. This journal captures that learning process honestly.

---

## Phase 1: Initial Setup and Technology Choices

### Choosing the Stack

When I first started, I had to decide on the technology stack. After research, I chose:

- **Next.js 16** with App Router and React 19
- **Convex** as backend (real-time database)
- **better-auth** for authentication
- **Tailwind CSS 4** for styling
- **shadcn/ui** for components
- **Monaco Editor** for the code editing experience
- **Bun** as package manager

The decision to use Convex over traditional backends was deliberate — I wanted real-time collaboration features without building a WebSocket server from scratch. The trade-off was learning Convex's specific constraints.

---

## Phase 2: First Major Bug — Next.js 16 params

### The Error

I had built a workspace page at `/workspace/[id]` and got this error:

```
A param property was accessed directly with `params.id`. 
`params` is a Promise and must be unwrapped with `React.use()` 
before accessing its properties.
```

I was confused — in previous Next.js versions, params was just an object. Why was it now a Promise?

### My Investigation

1. I read the Next.js 16 documentation
2. I realized React 19 introduced async components
3. Dynamic route parameters are now delivered as Promises

The solution involved importing `use` from React and unwrapping params:

```typescript
import { useState, useEffect, use } from "react";

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

### Reflection

I learned that framework versions matter significantly. Next.js 16 had breaking changes from version 14/15. Always check migration guides when using new versions.

---

## Phase 3: Convex Backend Challenges

### The setTimeout Error

When implementing the test runner functionality, I tried to add an artificial delay for mock API responses:

```typescript
async function callProvider(...) {
  const start = Date.now();
  await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));
  // ... return response
}
```

This caused:

```
Can't use setTimeout in queries and mutations. 
Please consider using an action.
```

### Understanding Convex's Model

I had to understand Convex's execution model:

- **Queries**: Read-only, can be cached
- **Mutations**: Write operations with return data
- **Actions**: Can make network calls, async operations

`setTimeout` is forbidden in queries/mutations to ensure deterministic execution.

### My Solution

Since my mock responses didn't actually need delays, I simply removed them. For real API calls, I'd need to use Actions.

---

## Phase 4: Authentication Issues

### The "Not Authenticated" Error

I kept getting "Not authenticated" errors when querying prompts:

```
Server Error: Not authenticated
```

This came from my `getUserIdOrThrow` function in the Convex backend, which is called for access control.

### Debugging Steps

1. Checked if user session was actually being passed
2. Verified better-auth was configured correctly
3. Ran `npx convex dev` to re-authenticate

The issue was sometimes my Convex dev token had expired, or there were network issues between the client and Convex server.

### The Fix

I learned to:
- Re-run `npx convex dev` when auth issues appear
- Check Convex deployment dashboard for auth status
- Add a debug page to view current auth state during development

---

## Phase 5: Hydration Mismatch

### Strange CSS Class Errors

I saw hydration errors in the browser console:

```
className="h-full antialiased" (server) vs 
className="h-full antialiased idc0_343 oqknntdc" (client)
```

The `<html>` element had different classes between server and client!

### My Investigation

1. Checked if it was a Tailwind issue
2. Discovered Tailwind v4 uses runtime class generation
3. Next.js 16's Turbopack also handles classes internally

The extra classes (`idc0_343`, `oqknntdc`) were generated at runtime by Tailwind v4 or Next.js dev mode, but differently on server vs client.

### Current Status

This remains partially unresolved. For production, I'd need to investigate Tailwind v4 configuration options more deeply. For now, it's a minor development-mode issue.

---

## Phase 6: Form Validation with Felte

### The Auth Page Issues

I built login/signup forms and they weren't displaying validation errors properly. The form would submit even with invalid data.

### My Investigation

I had to understand how Felte handles errors:

```typescript
// WRONG - treating errors as object
{loginErrors.email && <p>{loginErrors.email}</p>}

// CORRECT - errors is a getter function  
{loginErrors().email && <p>{loginErrors().email}</p>}
```

I also confused Felte's `useField` hook with react-hook-form patterns since I was initially considering switching libraries.

### The Fix

Updated the error display to call the getter function properly:

```typescript
{loginErrors().email && (
  <p className="text-sm text-destructive">{loginErrors().email}</p>
)}
{loginErrors().password && (
  <p className="text-sm text-destructive">{loginErrors().password}</p>
)}
```

### Decision

I chose to keep simple `<p>` error tags rather than fully integrating shadcn form components. This was a trade-off between consistency and development speed.

---

## Phase 7: Displaying User Names

### IDs Instead of Names

In the version history and comments, users saw long strings like "k567abc123" instead of names.

### My Investigation

1. Checked the backend — `authorName` was sometimes undefined
2. The `getUserName` function fell back to `user._id.toString().slice(0, 8)`
3. If users don't set their profile name, they see sliced IDs

### My Solution

Added better fallbacks in both backend and frontend:

```typescript
{/* Frontend mapping */}
author: { name: v.authorName ?? v.authorId }

// Backend ensures fallback
getUserName = user?.name ?? user?._id.toString().slice(0, 8) ?? "Unknown"
```

### Reflection

This is ongoing — users need to set their profile names in better-auth for this to work fully.

---

## Phase 8: From Mock Data to Real Queries

### The "Fake" Sidebar

I noticed the sidebar was showing hardcoded data:

```typescript
const DEMO_WORKSPACES = [
  { id: "demo-workspace", name: "My Prompts", ... },
  { id: "shared-workspace", name: "Team Prompts", ... },
];
```

This was hardcoded "demo" data, not from my database!

### My Solution

I rewrote the Sidebar to use real Convex queries:

```typescript
const allWorkspaces = useQuery(api.workspaces.listWorkspaces, {});
const prompts = useQuery(api.prompts.listPrompts, { workspaceId });

const sidebarWorkspaces = (allWorkspaces ?? []).map((ws) => ({
  id: ws._id,
  name: ws.name,
  prompts: (prompts ?? []).map((p) => ({ ... })),
}));
```

### Trade-off

Demo data served as useful fixtures for boneyard (screenshot capture). I kept them as fallback fixtures but query real data in production.

---

## Phase 9: UI Polish

### Common Issues I Fixed

Through testing, I addressed common UI problems:

1. **Inconsistent icon sizing** - Enforced w-6 h-6 for all Lucide icons (24x24 viewBox)
2. **Content hidden behind navbar** - Added proper padding  
3. **Test loading state** - Added proper loading/error state handling:

```typescript
const handleTest = async () => {
  setTesting(true);
  try {
    await runTestMutation({...});
  } catch (err) {
    console.error(err);
  } finally {
    setTesting(false);  // Always reset in finally
  }
};
```

---

## Phase 10: Schema Migration

### Database Compatibility

When testing, my queries failed because old database documents had fields no longer in the schema:

- Old `votes` had `promptId` 
- New schema didn't include it

### My Solution

I made certain fields optional for backward compatibility:

```typescript
// In schema
versionId: v.optional(v.id("promptVersions")),
```

Also noted that for production, old data should be migrated or cleared before schema changes.

---

## Technical Decisions Summary

| Decision | Rationale |
|----------|----------|
| Next.js App Router | Modern React 19 support |
| Convex backend | Real-time sync without WebSocket server |
| Dark theme only | Simpler, aesthetic choice |
| shadcn/ui | Accessible, customizable |
| Custom Monaco language | Better template variable highlighting |
| Skip pattern for queries | Avoid unnecessary DB calls |

---

## Remaining Issues

1. **Hydration mismatch** - Tailwind v4 / Next.js 16 interaction
2. **Intermittent auth** - May need re-auth during long sessions
3. **User names** - Requires users to set profile names

---

## What I Learned

This project taught me:

1. **Read the migration guides** — Don't assume frameworks work the same between versions
2. **Understand platform constraints** — Convex, Next.js, Tailwind all have specific rules
3. **Debug systematically** — Error messages often point to solutions
4. **Trade-offs are inevitable** — Speed vs completeness, mock vs real data
5. **AI assistance accelerates** — But understanding still required

---

## Conclusion

Building a collaborative prompt engineering platform required balancing multiple concerns: real-time collaboration, authentication, version history, testing, and a good user experience. Every feature had hidden complexity.

The bugs I encountered were as valuable as the features — each error taught me something about the tools I chose. The hardest part was understanding when to accept partial solutions versus when to dig deeper.

---

*Submitted for Licenta — Computer Science*
*Project: Collaborative Prompt Engineering Platform*
*Date: April 2026*