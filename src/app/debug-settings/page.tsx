"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { GlobeIcon, LockIcon, Loader2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

export default function DebugSettingsPage() {
  const router = useRouter();
  const { data: session, isLoading } = authClient.useSession();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    router.push("/auth");
    return null;
  }
  const [name, setName] = useState("My Workspace")
  const [isPublic, setIsPublic] = useState(false)

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Workspace Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your workspace preferences, members, and integrations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Basic workspace information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="workspace-name">Workspace Name</Label>
            <Input
              id="workspace-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter workspace name"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {isPublic ? (
                  <GlobeIcon className="size-4 text-muted-foreground" />
                ) : (
                  <LockIcon className="size-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">Public Workspace</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {isPublic
                  ? "Anyone can view this workspace"
                  : "Only invited members can access"}
              </p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          <div className="flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}