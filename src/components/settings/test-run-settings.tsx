"use client"

import { useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

interface TestRunSettingsProps {
  workspaceId: string
}

const models = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "claude-sonnet-4", label: "Claude Sonnet 4" },
  { value: "claude-haiku-3", label: "Claude Haiku 3" },
  { value: "gemini-2-flash", label: "Gemini 2 Flash" },
]

export function TestRunSettings({ workspaceId }: TestRunSettingsProps) {
  const [model, setModel] = useState("gpt-4o")
  const [temperature, setTemperature] = useState(0.7)
  const [topP, setTopP] = useState(0.9)
  const [maxTokens, setMaxTokens] = useState(2048)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 1000))
    setSaving(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Run Configuration</CardTitle>
        <CardDescription>
          Default parameters for running tests in this workspace
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-2">
          <Label htmlFor="model-select">Model</Label>
          <Select value={model} onValueChange={(v) => v && setModel(v)}>
            <SelectTrigger id="model-select" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {models.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Temperature</Label>
              <span className="text-sm text-muted-foreground font-mono">
                {temperature.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[temperature]}
              onValueChange={(v) => setTemperature(Number(Array.isArray(v) ? v[0] : v))}
              min={0}
              max={2}
              step={0.1}
              className="py-2"
            />
            <p className="text-xs text-muted-foreground">
              Higher values make output more random
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Top P</Label>
              <span className="text-sm text-muted-foreground font-mono">
                {topP.toFixed(2)}
              </span>
            </div>
            <Slider
              value={[topP]}
              onValueChange={(v) => setTopP(Number(Array.isArray(v) ? v[0] : v))}
              min={0}
              max={1}
              step={0.01}
              className="py-2"
            />
            <p className="text-xs text-muted-foreground">
              Nucleus sampling threshold
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Max Tokens</Label>
              <span className="text-sm text-muted-foreground font-mono">
                {maxTokens}
              </span>
            </div>
            <Slider
              value={[maxTokens]}
              onValueChange={(v) => setMaxTokens(Number(Array.isArray(v) ? v[0] : v))}
              min={256}
              max={8192}
              step={256}
              className="py-2"
            />
            <p className="text-xs text-muted-foreground">
              Maximum tokens to generate
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}