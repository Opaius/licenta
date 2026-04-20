"use client"

import { useState } from "react"
import { KeyIcon, PlusIcon, TrashIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ApiKey {
  id: string
  label: string
  provider: "openai" | "anthropic" | "google" | "mistral" | "xai"
  keyPrefix: string
  createdAt: string
}

interface ApiKeysSettingsProps {
  workspaceId: string
}

const initialKeys: ApiKey[] = [
  { id: "1", label: "Production OpenAI", provider: "openai", keyPrefix: "sk-abc...", createdAt: "2024-01-15" },
  { id: "2", label: "Dev Anthropic", provider: "anthropic", keyPrefix: "sk-ant...", createdAt: "2024-02-20" },
]

const providerLabels: Record<ApiKey["provider"], string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google",
  mistral: "Mistral",
  xai: "xAI",
}

export function ApiKeysSettings({ workspaceId }: ApiKeysSettingsProps) {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys)
  const [modalOpen, setModalOpen] = useState(false)
  const [newKey, setNewKey] = useState({ label: "", provider: "openai" as ApiKey["provider"], key: "" })

  const handleAddKey = () => {
    if (!newKey.key || !newKey.label) return
    
    const keyPrefix = newKey.key.slice(0, 7) + "..."
    const key: ApiKey = {
      id: Date.now().toString(),
      label: newKey.label,
      provider: newKey.provider,
      keyPrefix,
      createdAt: new Date().toISOString().split("T")[0],
    }
    
    setKeys((prev) => [...prev, key])
    setNewKey({ label: "", provider: "openai", key: "" })
    setModalOpen(false)
  }

  const deleteKey = (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
        <CardDescription>
          Manage your own API keys (BYOK — Bring Your Own Key)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-end">
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger>
              <Button>
                <PlusIcon className="size-4" />
                Add Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add API Key</DialogTitle>
                <DialogDescription>
                  Enter your API key from your provider&apos;s dashboard
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="key-label">Label</Label>
                  <Input
                    id="key-label"
                    value={newKey.label}
                    onChange={(e) => setNewKey((prev) => ({ ...prev, label: e.target.value }))}
                    placeholder="e.g., Production API"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="key-provider">Provider</Label>
                  <Select
                    value={newKey.provider}
                    onValueChange={(v) => setNewKey((prev) => ({ ...prev, provider: v as ApiKey["provider"] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="mistral">Mistral</SelectItem>
                      <SelectItem value="xai">xAI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={newKey.key}
                    onChange={(e) => setNewKey((prev) => ({ ...prev, key: e.target.value }))}
                    placeholder="sk-..."
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddKey} disabled={!newKey.key || !newKey.label}>
                  Add Key
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {keys.map((key) => (
          <div
            key={key.id}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div className="flex items-center gap-3">
              <KeyIcon className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{key.label}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {key.keyPrefix}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{providerLabels[key.provider]}</Badge>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => deleteKey(key.id)}
              >
                <TrashIcon className="size-4" />
              </Button>
            </div>
          </div>
        ))}

        {keys.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            <KeyIcon className="mx-auto mb-2 size-8 opacity-50" />
            <p className="text-sm">No API keys configured</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}