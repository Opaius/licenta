# Stratum Live - Implementation Log

## Project Context
- **Type**: Graduation thesis (licență)
- **Stack**: Next.js 16, Convex, Better-Auth, shadcn/ui, TailwindCSS 4, Yjs

---

## Impediments & Decisions Log

### [1] Authentication Choice
- **Date**: 2026-04-20
- **Issue**: How to integrate auth with Convex
- **Decision**: Use `@convex-dev/better-auth` official package instead of custom auth
- **Reason**: Official package provides full Better-Auth integration with Convex queries

### [2] Real-time Collab Approach
- **Date**: 2026-04-20
- **Issue**: How to handle real-time collaborative editing
- **Decision**: Yjs with Convex subscriptions
- **Reason**: Yjs is industry standard for CRDT-based collab, Convex provides realtime sync

### [3] API Layer
- **Date**: 2026-04-20
- **Issue**: Need API routes?
- **Decision**: No API routes - all via Convex queries/mutations
- **Reason**: Convex handles all backend, no separate API layer needed

### [4] Package Version Conflict
- **Date**: 2026-04-20
- **Issue**: better-auth 1.6.x incompatible with @convex-dev/better-auth
- **Decision**: Use better-auth 1.5.6
- **Impediment**: Had to pin better-auth to 1.5.x for compatibility

### [5] Better-Auth Integration Setup
- **Date**: 2026-04-20
- **Issue**: Complex setup with local installation
- **Decision**: Use simpler setup - component registration only
- **Impediment**: Full example requires additional files (email.ts, http.ts)

---

## Delegation Log

### Agent 1: [Name]
- **Task**: 
- **Status**: pending/in_progress/completed
- **Impediments**: 
- **Result**: 

---

## Technical Decisions

### Database Schema (Convex Tables)
- users (managed by Better-Auth)
- workspaces  
- workspaceMembers
- invites
- prompts
- promptVersions
- promptBranches
- votes
- comments
- apiKeys
- testRuns
- notifications

---

## Development Notes

### Setup Completed
1. Next.js 16.2.x initialized with TypeScript + TailwindCSS 4
2. Convex 1.35.x backend initialized
3. Better-Auth 1.5.6 + @convex-dev/better-auth 0.11.x installed
4. shadcn/ui 4.x configured
5. Yjs installed for real-time collab
6. Schema defined with 12 tables
