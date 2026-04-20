"use client"

import { useState } from "react"
import { GlobeIcon, LockIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

interface WorkspaceSettingsProps {
  workspaceId: string
}

export function WorkspaceSettings({ workspaceId }: WorkspaceSettingsProps) {
  const [name, setName] = useState("My Workspace")
  const [isPublic, setIsPublic] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 1000))
    setSaving(false)
  }

  return (
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
          <Switch
            checked={isPublic}
            onCheckedChange={setIsPublic}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
