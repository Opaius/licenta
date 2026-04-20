"use client"

import { useState } from "react"
import { CopyIcon, LinkIcon, RefreshCwIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface InviteSettingsProps {
  workspaceId: string
}

export function InviteSettings({ workspaceId }: InviteSettingsProps) {
  const [inviteLink, setInviteLink] = useState(
    `${window.location.origin}/invite/${workspaceId}-abc123`
  )
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegenerate = async () => {
    setGenerating(true)
    await new Promise((r) => setTimeout(r, 1000))
    const newToken = Math.random().toString(36).substring(2, 10)
    setInviteLink(`${window.location.origin}/invite/${workspaceId}-${newToken}`)
    setGenerating(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite</CardTitle>
        <CardDescription>
          Generate an invite link to share with new members
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={inviteLink}
              readOnly
              className="pl-9 pr-20"
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <CopyIcon
              data-icon={copied ? "inline-start" : undefined}
              className="size-4"
            />
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Regenerate Link</p>
            <p className="text-xs text-muted-foreground">
              Create a new invite link, invalidating the old one
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={generating}
          >
            <RefreshCwIcon
              className={`size-4 ${generating ? "animate-spin" : ""}`}
            />
            Regenerate
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}