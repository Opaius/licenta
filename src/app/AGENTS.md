# App Routes

Next.js App Router (Next.js 16.2.4).

## ROUTES
| Route | Purpose |
|------|---------|
| / | Landing page |
| /auth | Auth page |
| /dashboard | Dashboard |
| /workspace/[id] | Editor |
| /workspace/[id]/settings | Workspace settings |
| /api/auth/[...all] | better-auth API |
| /debug-settings | Debug page |

## CONVENTIONS
- Folder-based routing with [id] for dynamic params
- React 19 Server Components
- Convex query hooks in client components

## ANTI-PATTERNS
- NO Client Components unless needed
- NO loading.tsx in app routes (use Suspense)