# Convex Backend

16 functions. Auth, workspaces, prompts, API keys, voting.

## FUNCTIONS
| Module | File |
|--------|------|
| Auth | auth.ts, auth.config.ts |
| Workspaces | workspaces.ts, workspaceMembers.ts |
| Prompts | prompts.ts |
| API Keys | apiKeys.ts |
| Voting | voting.ts |
| Comments | comments.ts |
| Test Runs | testRuns.ts |
| Notifications | notifications.ts |
| HTTP | http.ts |

## DATA MODEL
Schema in `schema.ts`.
Generated types in `_generated/`.

## CONVENTIONS
- better-auth for authentication
- Convex schema with Zod validation
- Migrations via `npx convex migrate`