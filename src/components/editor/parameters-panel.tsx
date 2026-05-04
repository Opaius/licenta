"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  HashIcon,
  TypeIcon,
  ToggleLeftIcon,
  BracesIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  LoaderIcon,
  KeyIcon,
  SlidersIcon,
  Braces,
  PlusIcon,
  XIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Parameter {
  name: string;
  defaultValue?: string;
  valueType: "string" | "number" | "boolean" | "object";
  testValue?: string;
}

export interface ModelOption {
  id: string;
  name: string;
}

export interface ModelSetting {
  key: string;
  value: string | number | boolean;
  type: "number" | "string" | "boolean";
}

interface ParametersPanelProps {
  workspaceId: string;
  content: string;
  testValues: Record<string, string>;
  onTestValuesChange: (values: Record<string, string>) => void;
  apiKeys?: Array<{ _id: string; provider: string; label: string; maskedKey: string; baseUrl?: string }>;
  selectedKeyId?: string;
  onKeyChange?: (keyId: string) => void;
  models?: ModelOption[];
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  onTemperatureChange?: (v: number) => void;
  onMaxTokensChange?: (v: number) => void;
  temperature?: number;
  maxTokens?: number;
  modelSettings?: ModelSetting[];
  onModelSettingsChange?: (settings: ModelSetting[]) => void;
}

function extractParameters(content: string): Parameter[] {
  const regex = /\{\{(\w+)(?:\s*\|\s*([^}]+))?\}\}/g;
  const seen = new Set<string>();
  const params: Parameter[] = [];

  let match;
  while ((match = regex.exec(content)) !== null) {
    const name = match[1];
    const defaultValue = match[2]?.trim();

    if (seen.has(name)) continue;
    seen.add(name);

    let valueType: Parameter["valueType"] = "string";
    if (defaultValue !== undefined) {
      if (defaultValue === "true" || defaultValue === "false") {
        valueType = "boolean";
      } else if (!isNaN(Number(defaultValue)) && defaultValue !== "") {
        valueType = "number";
      } else if (defaultValue.startsWith("{") || defaultValue.startsWith("[")) {
        valueType = "object";
      }
    }

    params.push({ name, defaultValue, valueType });
  }

  return params;
}

function getTypeIcon(type: Parameter["valueType"]) {
  switch (type) {
    case "number":
      return <HashIcon className="size-3" />;
    case "boolean":
      return <ToggleLeftIcon className="size-3" />;
    case "object":
      return <BracesIcon className="size-3" />;
    default:
      return <TypeIcon className="size-3" />;
  }
}

function CollapsibleSection({
  icon: Icon,
  title,
  children,
  defaultOpen = true,
  action,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  action?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="flex flex-col">
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between px-3 py-1.5 bg-muted/40 border-b border-t first:border-t-0 hover:bg-muted/60 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-1.5">
          <Icon className="size-3 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {action}
          {open ? (
            <ChevronDownIcon className="size-3 text-muted-foreground" />
          ) : (
            <ChevronRightIcon className="size-3 text-muted-foreground" />
          )}
        </div>
      </div>
      {open && <div className="flex flex-col">{children}</div>}
    </div>
  );
}

export function ParametersPanel({
  workspaceId,
  content,
  testValues,
  onTestValuesChange,
  apiKeys = [],
  selectedKeyId,
  onKeyChange,
  models = [],
  selectedModel,
  onModelChange,
  onTemperatureChange,
  onMaxTokensChange,
  temperature,
  maxTokens,
  modelSettings = [],
  onModelSettingsChange,
}: ParametersPanelProps) {
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [showKeyDropdown, setShowKeyDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showAddKeyDialog, setShowAddKeyDialog] = useState(false);
  const [newKeyProvider, setNewKeyProvider] = useState("openai");
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [newKeySecret, setNewKeySecret] = useState("");
  const [newKeyBaseUrl, setNewKeyBaseUrl] = useState("");
  const [addingKey, setAddingKey] = useState(false);
  const [showAddSettingDialog, setShowAddSettingDialog] = useState(false);
  const [newSettingKey, setNewSettingKey] = useState("");
  const [newSettingType, setNewSettingType] = useState<"number" | "string" | "boolean">("number");
  const [newSettingValue, setNewSettingValue] = useState("");

  const addApiKey = useMutation(api.apiKeys.addApiKey);

  useEffect(() => {
    setParameters(extractParameters(content));
  }, [content]);

  const handleValueChange = useCallback(
    (name: string, value: string) => {
      onTestValuesChange({ ...testValues, [name]: value });
    },
    [testValues, onTestValuesChange]
  );

  const handleClear = useCallback(() => {
    onTestValuesChange({});
  }, [onTestValuesChange]);

  const handleAddKey = async () => {
    if (!newKeyLabel.trim() || !newKeySecret.trim()) return;
    setAddingKey(true);
    try {
      await addApiKey({
        workspaceId: workspaceId as any,
        provider: newKeyProvider as any,
        label: newKeyLabel.trim(),
        secret: newKeySecret.trim(),
        baseUrl: newKeyProvider === "litellm" ? newKeyBaseUrl.trim() || undefined : undefined,
      });
      setNewKeyLabel("");
      setNewKeySecret("");
      setNewKeyBaseUrl("");
      setShowAddKeyDialog(false);
    } catch (e) {
      console.error(e);
    } finally {
      setAddingKey(false);
    }
  };

  const handleAddSetting = () => {
    if (!newSettingKey.trim()) return;
    let parsedValue: string | number | boolean = newSettingValue;
    if (newSettingType === "number") {
      parsedValue = parseFloat(newSettingValue) || 0;
    } else if (newSettingType === "boolean") {
      parsedValue = newSettingValue === "true";
    }
    const existing = modelSettings.find((s) => s.key === newSettingKey.trim());
    if (existing) {
      onModelSettingsChange?.(
        modelSettings.map((s) =>
          s.key === newSettingKey.trim() ? { ...s, value: parsedValue, type: newSettingType } : s
        )
      );
    } else {
      onModelSettingsChange?.([
        ...modelSettings,
        { key: newSettingKey.trim(), value: parsedValue, type: newSettingType },
      ]);
    }
    setNewSettingKey("");
    setNewSettingValue("");
    setNewSettingType("number");
    setShowAddSettingDialog(false);
  };

  const handleRemoveSetting = (key: string) => {
    onModelSettingsChange?.(modelSettings.filter((s) => s.key !== key));
  };

  const handleUpdateSetting = (key: string, value: string | number | boolean) => {
    onModelSettingsChange?.(
      modelSettings.map((s) => (s.key === key ? { ...s, value } : s))
    );
  };

  return (
    <div className="flex flex-col h-full bg-sidebar border-r">
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="text-sm font-semibold">Parameters</h3>
        <Button variant="ghost" size="icon-xs" onClick={handleClear} title="Clear test values">
          <TrashIcon className="size-3" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col">

          {/* Provider Section */}
          <CollapsibleSection icon={KeyIcon} title="Provider" defaultOpen={true}>
            <div className="p-3 space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/80">API Key</label>
                <div className="relative">
                  <button
                    onClick={() => setShowKeyDropdown(!showKeyDropdown)}
                    className={cn(
                      "w-full h-8 px-2 flex items-center justify-between text-xs border rounded-md bg-background hover:bg-muted transition-colors",
                      !selectedKeyId && "text-muted-foreground"
                    )}
                  >
                    <span className="truncate">
                      {selectedKeyId
                        ? apiKeys.find(k => k._id === selectedKeyId)?.label || "Select key..."
                        : "Select API key..."}
                    </span>
                    <ChevronDownIcon className="size-3 shrink-0" />
                  </button>
                  {showKeyDropdown && (
                    <div className="absolute z-10 w-full mt-1 border rounded-md bg-popover shadow-md max-h-40 overflow-auto">
                      {apiKeys.length === 0 ? (
                        <div className="p-2 text-xs text-muted-foreground">No API keys in workspace</div>
                      ) : (
                        apiKeys.map(key => (
                          <button
                            key={key._id}
                            onClick={() => {
                              onKeyChange?.(key._id);
                              setShowKeyDropdown(false);
                            }}
                            className={cn(
                              "w-full px-2 py-1.5 text-left text-xs hover:bg-muted transition-colors",
                              selectedKeyId === key._id && "bg-muted"
                            )}
                          >
                            <div className="font-medium">{key.label}</div>
                            <div className="text-muted-foreground text-[10px]">{key.maskedKey} · {key.provider}</div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <Dialog open={showAddKeyDialog} onOpenChange={setShowAddKeyDialog}>
                  <DialogTrigger>
                    <span className="flex items-center justify-center w-full h-7 text-xs gap-1 rounded-md hover:bg-muted transition-colors cursor-pointer">
                      <PlusIcon className="size-3" />
                      Add API Key
                    </span>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add API Key</DialogTitle>
                      <DialogDescription>
                        Add a new API key for this workspace. The key will be encrypted before storage.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Provider</label>
                        <Select value={newKeyProvider} onValueChange={(v) => v && setNewKeyProvider(v)}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="openai">OpenAI</SelectItem>
                            <SelectItem value="anthropic">Anthropic</SelectItem>
                            <SelectItem value="ollama">Ollama</SelectItem>
                            <SelectItem value="litellm">LiteLLM Proxy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Label</label>
                        <Input
                          placeholder="e.g. Production OpenAI"
                          value={newKeyLabel}
                          onChange={(e) => setNewKeyLabel(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Secret Key</label>
                        <Input
                          type="password"
                          placeholder={newKeyProvider === "litellm" ? "litellm-master-key" : "sk-..."}
                          value={newKeySecret}
                          onChange={(e) => setNewKeySecret(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      {newKeyProvider === "litellm" && (
                        <div className="space-y-1">
                          <label className="text-xs font-medium">Proxy URL</label>
                          <Input
                            placeholder="http://localhost:4000"
                            value={newKeyBaseUrl}
                            onChange={(e) => setNewKeyBaseUrl(e.target.value)}
                            className="h-8 text-xs"
                          />
                          <p className="text-[10px] text-muted-foreground">
                            Leave empty to use http://localhost:4000
                          </p>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button size="sm" onClick={handleAddKey} disabled={addingKey || !newKeyLabel.trim() || !newKeySecret.trim()}>
                        {addingKey ? "Adding..." : "Add Key"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/80">Model</label>
                <div className="relative">
                  <button
                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                    disabled={!selectedKeyId || models.length === 0}
                    className="w-full h-8 px-2 flex items-center justify-between text-xs border rounded-md bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="truncate flex items-center gap-1.5">
                      {models.length === 0 && selectedKeyId ? (
                        <LoaderIcon className="size-3 animate-spin" />
                      ) : null}
                      {selectedModel || "Select model..."}
                    </span>
                    {models.length > 0 && <ChevronDownIcon className="size-3 shrink-0" />}
                  </button>
                  {showModelDropdown && models.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 border rounded-md bg-popover shadow-md max-h-40 overflow-auto">
                      {models.map(model => (
                        <button
                          key={model.id}
                          onClick={() => {
                            onModelChange?.(model.name);
                            setShowModelDropdown(false);
                          }}
                          className={cn(
                            "w-full px-2 py-1.5 text-left text-xs hover:bg-muted transition-colors",
                            selectedModel === model.name && "bg-muted"
                          )}
                        >
                          {model.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Model Settings Section */}
          <CollapsibleSection
            icon={SlidersIcon}
            title="Model Settings"
            defaultOpen={true}
            action={
              <div onClick={(e) => e.stopPropagation()}>
                <Dialog open={showAddSettingDialog} onOpenChange={setShowAddSettingDialog}>
                  <DialogTrigger>
                    <span className="flex items-center justify-center size-6 rounded-md hover:bg-muted transition-colors cursor-pointer" title="Add custom setting">
                      <PlusIcon className="size-3" />
                    </span>
                  </DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Add Model Setting</DialogTitle>
                    <DialogDescription>
                      Add any OpenAI-compatible parameter (top_p, frequency_penalty, presence_penalty, seed, stop, etc.)
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Setting Name</label>
                      <Input
                        placeholder="e.g. top_p, frequency_penalty"
                        value={newSettingKey}
                        onChange={(e) => setNewSettingKey(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Type</label>
                      <Select value={newSettingType} onValueChange={(v) => v && setNewSettingType(v as any)}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Value</label>
                      <Input
                        placeholder={newSettingType === "number" ? "0.9" : newSettingType === "boolean" ? "true" : "value"}
                        value={newSettingValue}
                        onChange={(e) => setNewSettingValue(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button size="sm" onClick={handleAddSetting} disabled={!newSettingKey.trim()}>
                      Add Setting
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              </div>
            }
          >
            <div className="p-3 space-y-3">
              {/* Built-in: Temperature */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/80">
                  Temperature: <span className="text-primary font-mono">{(temperature ?? 0.7).toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature ?? 0.7}
                  onChange={(e) => onTemperatureChange?.(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-full bg-muted accent-primary cursor-pointer"
                />
              </div>

              {/* Built-in: Max Tokens */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/80">Max Tokens</label>
                <Input
                  type="number"
                  value={maxTokens ?? 2048}
                  onChange={(e) => onMaxTokensChange?.(parseInt(e.target.value) || 2048)}
                  className="h-7 text-xs"
                />
              </div>

              {/* Custom settings */}
              {modelSettings.map((setting) => (
                <div key={setting.key} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-foreground/80">{setting.key}</label>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleRemoveSetting(setting.key)}
                      title="Remove setting"
                    >
                      <XIcon className="size-3 text-muted-foreground" />
                    </Button>
                  </div>
                  {setting.type === "boolean" ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant={setting.value === true ? "default" : "outline"}
                        size="sm"
                        className="h-6 text-xs flex-1"
                        onClick={() => handleUpdateSetting(setting.key, true)}
                      >
                        true
                      </Button>
                      <Button
                        variant={setting.value === false ? "default" : "outline"}
                        size="sm"
                        className="h-6 text-xs flex-1"
                        onClick={() => handleUpdateSetting(setting.key, false)}
                      >
                        false
                      </Button>
                    </div>
                  ) : setting.type === "number" ? (
                    <Input
                      type="number"
                      step="any"
                      value={setting.value as number}
                      onChange={(e) => handleUpdateSetting(setting.key, parseFloat(e.target.value) || 0)}
                      className="h-7 text-xs"
                    />
                  ) : (
                    <Input
                      type="text"
                      value={setting.value as string}
                      onChange={(e) => handleUpdateSetting(setting.key, e.target.value)}
                      className="h-7 text-xs"
                    />
                  )}
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Template Variables Section */}
          <CollapsibleSection
            icon={Braces}
            title="Template Variables"
            defaultOpen={true}
            action={
              parameters.length > 0 ? (
                <Button variant="ghost" size="icon-xs" onClick={handleClear} title="Clear values">
                  <TrashIcon className="size-3" />
                </Button>
              ) : undefined
            }
          >
            <div className="p-3 space-y-3">
              {parameters.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No variables detected.
                  <br />
                  Use {"{{"}variable{"}}"} syntax in your prompt.
                </p>
              ) : (
                parameters.map((param) => (
                  <div key={param.name} className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      {getTypeIcon(param.valueType)}
                      <span className="text-xs font-medium">{param.name}</span>
                      <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                        {param.valueType}
                      </Badge>
                    </div>

                    {param.defaultValue !== undefined && (
                      <p className="text-[10px] text-muted-foreground">
                        default: <code className="bg-muted px-1 rounded">{param.defaultValue}</code>
                      </p>
                    )}

                    {param.valueType === "boolean" ? (
                      <div className="flex items-center gap-2">
                        <Button
                          variant={testValues[param.name] === "true" ? "default" : "outline"}
                          size="sm"
                          className="h-6 text-xs flex-1"
                          onClick={() => handleValueChange(param.name, "true")}
                        >
                          true
                        </Button>
                        <Button
                          variant={testValues[param.name] === "false" ? "default" : "outline"}
                          size="sm"
                          className="h-6 text-xs flex-1"
                          onClick={() => handleValueChange(param.name, "false")}
                        >
                          false
                        </Button>
                      </div>
                    ) : (
                      <Input
                        type={param.valueType === "number" ? "number" : "text"}
                        placeholder={param.defaultValue ?? `Enter ${param.name}...`}
                        value={testValues[param.name] ?? ""}
                        onChange={(e) => handleValueChange(param.name, e.target.value)}
                        className="h-7 text-xs"
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </CollapsibleSection>
        </div>
      </ScrollArea>
    </div>
  );
}
