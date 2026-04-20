# Stratum Live - Specification

## 1. Project Overview

**Name**: Stratum Live
**Type**: Real-time collaborative prompt engineering webapp
**Stack**:
- Next.js 16.2.x (App Router)
- Convex 1.35.x
- better-auth 1.6.x
- @convex-dev/better-auth 0.11.x
- shadcn/ui 4.x
- TailwindCSS 4.x
- Yjs (real-time collab)
**Deployment**: Node.js server

Real-time collaborative workspace for teams to edit prompts, test across models, vote on best versions.

---

## 2. Core Features

### 2.1 Prompt Editor
- Real-time collaborative editing with CRDT (Yjs via Convex)
- Syntax highlighting for prompt templates (`{{variable}}`)
- Auto-save with version history
- Branch creation from any version

### 2.2 Real-time Presence
- Online users list with avatars
- Cursor positions visible to all participants
- "User is typing..." indicators

### 2.3 Version Control
- Every edit creates new version
- Version history panel with timestamps and authors
- Branch from any version
- Restore previous version

### 2.4 Comments
- Inline comments on selected text
- Thread replies
- Resolve/unresolve comments
- Comment notifications

### 2.5 Prompt Voting
- Upvote/downvote prompts
- Vote count displayed
- Sort by votes

### 2.6 Parallel Testing
- Select multiple models (OpenAI, Anthropic, Ollama)
- Configure temperature, top_p, max_tokens per test
- Run prompts across all configured models
- Display results side-by-side

### 2.7 Templates
- Variable syntax: `{{variable}}`
- Runtime input form provided
- Template previews

### 2.8 Results Comparison
- Side-by-side view
- Diff highlighting
- Score/rank outputs

### 2.9 BYOK (Bring Your Own Key)
- Users add their own API keys per workspace
- Keys stored encrypted
- Per-provider configuration (OpenAI, Anthropic)
- Key validation before use

### 2.10 Permissions
- **Public workspace**: Anyone with link can view/edit
- **Private workspace**: Invitation-only
- Roles: Owner, Editor, Viewer
- Invite via link with optional code

### 2.11 Notifications
- Mention notifications
- Comment notifications
- Vote notifications
- Share notifications

### 2.12 Import/Export
- Export: JSON, Markdown
- Import: JSON

---

## 3. Auth

- **Provider**: Email + Password via Better-Auth
- **Email verification**: Optional (simple token)

---

## 4. Data Model (Convex)

### Users
```
users: {
  id, email, passwordHash, name, avatar, createdAt
}
```

### Workspaces
```
workspaces: {
  id, name, ownerId, isPublic, createdAt
}
```

### WorkspaceMembers
```
workspaceMembers: {
  workspaceId, userId, role (owner/editor/viewer)
}
```

### Invites
```
invites: {
  id, workspaceId, code, creatorId, createdAt
}
```

### Prompts
```
prompts: {
  id, workspaceId, title, content, templateVars, createdAt, authorId
}
```

### PromptVersions
```
promptVersions: {
  id, promptId, content, version, createdAt, authorId
}
```

### PromptBranches
```
promptBranches: {
  id, promptId, name, baseVersion, createdAt
}
```

### Votes
```
votes: {
  id, promptId, userId, value (1/-1)
}
```

### Comments
```
comments: {
  id, promptId, versionId, content, selectionRange, authorId, resolved, parentId
}
```

### ApiKeys (encrypted)
```
apiKeys: {
  id, workspaceId, provider, key, label, createdAt
}
```

### TestRuns
```
testRuns: {
  id, promptId, config (models, temp, params), results, createdAt
}
```

### Notifications
```
notifications: {
  id, userId, type, data, read, createdAt
}
```

---

## 5. Architecture

All backend via Convex queries/mutations. No separate API routes.

### Auth
- `@convex-dev/better-auth` 0.11.x with `better-auth` 1.6.x
- Email + password authentication

### Real-time
- Yjs for collaborative editing
- Convex for state sync + presence

---

## 6. UI Components

### Layout
- Sidebar: Workspaces list, navigation
- Main: Editor / Dashboard
- Header: User menu, notifications

### Editor View
- Toolbar: Save, branch, version, test, export
- Editor: CodeMirror/Yjs with presence
- Right panel: Versions, comments, votes
- Bottom: Test results

### Dashboard
- Workspaces grid/list
- Create workspace button
- Search/filter

### Workspace Settings
- Name, public/private toggle
- Members list
- Invite link
- API keys management

---

## 7. Acceptance Criteria

- [ ] User can sign up / sign in with email + password
- [ ] User can create workspace
- [ ] Workspace can be public or private
- [ ] User can invite others via link
- [ ] User can add BYOK (OpenAI, Anthropic)
- [ ] Multiple users can edit prompt simultaneously
- [ ] Cursors visible to all editors
- [ ] Every edit creates version
- [ ] User can view/restore version
- [ ] User can branch from version
- [ ] User can comment on prompt
- [ ] User can vote on prompt
- [ ] User can test prompt across models
- [ ] User can view results comparison
- [ ] User can export/import JSON
- [ ] Notifications work
- [ ] Responsive on mobile