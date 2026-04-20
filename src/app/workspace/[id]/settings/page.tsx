import { Suspense } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkspaceSettings } from "@/components/settings/workspace-settings"
import { MembersSettings } from "@/components/settings/members-settings"
import { InviteSettings } from "@/components/settings/invite-settings"
import { ApiKeysSettings } from "@/components/settings/api-keys-settings"
import { TestRunSettings } from "@/components/settings/test-run-settings"

export default function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const id = "demo-workspace"

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Workspace Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your workspace preferences, members, and integrations.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-5 lg:w-[500px]">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="invite">Invite</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="test-run">Test Run</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Suspense fallback={<div>Loading...</div>}>
            <WorkspaceSettings workspaceId={id} />
          </Suspense>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <Suspense fallback={<div>Loading...</div>}>
            <MembersSettings workspaceId={id} />
          </Suspense>
        </TabsContent>

        <TabsContent value="invite" className="space-y-6">
          <Suspense fallback={<div>Loading...</div>}>
            <InviteSettings workspaceId={id} />
          </Suspense>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-6">
          <Suspense fallback={<div>Loading...</div>}>
            <ApiKeysSettings workspaceId={id} />
          </Suspense>
        </TabsContent>

        <TabsContent value="test-run" className="space-y-6">
          <Suspense fallback={<div>Loading...</div>}>
            <TestRunSettings workspaceId={id} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
