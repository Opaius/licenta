<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# PROJECT KNOWLEDGE BASE

**Framework:** Next.js 16.2.4 + Convex + React 19
**Theme:** Dark only (`data-theme="dark"`)
**Stack:** TypeScript, Tailwind CSS 4, Valibot, Zod
**Package Manager:** bun

## STRUCTURE
```
./
├── src/
│   ├── app/           # Next.js App Router (workspace routes)
│   ├── components/    # UI components (shadcn-based)
│   └── lib/           # Utilities
├── convex/            # Convex backend functions
└── public/            # Static assets
```

## WHERE TO LOOK
| Task | Location |
|------|----------|
| Auth | `convex/auth.ts`, `src/app/auth/` |
| Workspace | `src/app/workspace/[id]/` |
| Editor | `src/components/editor/` |
| API Keys | `convex/apiKeys.ts` |

## CONVENTIONS
- Fonts: Roboto Serif (heading), Space Grotesk (body), Roboto Mono (code)
- Dark theme only - no light mode
- Zod for runtime, Valibot for forms (felte)
- shadcn components in `src/components/ui/`

## ANTI-PATTERNS
- NO light mode toggle
- NO CSS modules - Tailwind only

## COMMANDS
```bash
bun run dev     # Next.js dev + Convex dev
bun run build   # Production build
```

## NOTES
- `data-theme="dark"` hardcoded in root layout
- ConvexClientProvider wraps children
- Workspace ID from URL params (`[id]`)
