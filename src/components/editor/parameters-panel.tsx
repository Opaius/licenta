"use client";

import { useState, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  HashIcon,
  TypeIcon,
  ToggleLeftIcon,
  BracesIcon,
  PlayIcon,
  TrashIcon,
  ChevronDownIcon,
  LoaderIcon,
  KeyIcon,
  CpuIcon,
  SlidersIcon,
  Braces,
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

interface ParametersPanelProps {
  content: string;
  testValues: Record<string, string>;
  onTestValuesChange: (values: Record<string, string>) => void;
  onRunTest?: () => void;
  apiKeys?: Array<{ _id: string; provider: string; label: string; maskedKey: string }>;
  selectedKeyId?: string;
  onKeyChange?: (keyId: string) => void;
  models?: ModelOption[];
  onTemperatureChange?: (v: number) => void;
  onMaxTokensChange?: (v: number) => void;
  temperature?: number;
  maxTokens?: number;
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

function SectionHeader({ icon: Icon, title, action }: { icon: React.ElementType; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-muted/40 border-b border-t first:border-t-0">
      <div className="flex items-center gap-1.5">
        <Icon className="size-3 text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
      </div>
      {action}
    </div>
  );
}

export function ParametersPanel({
  content,
  testValues,
  onTestValuesChange,
  onRunTest,
  apiKeys = [],
  selectedKeyId,
  onKeyChange,
  models = [],
  onTemperatureChange,
  onMaxTokensChange,
  temperature,
  maxTokens,
}: ParametersPanelProps) {
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [showKeyDropdown, setShowKeyDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("");

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

  const provider = selectedKeyId ? apiKeys.find(k => k._id === selectedKeyId)?.provider : null;

  return (
    <div className="flex flex-col h-full bg-sidebar border-r">
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="text-sm font-semibold">Parameters</h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-xs" onClick={handleClear} title="Clear test values">
            <TrashIcon className="size-3" />
          </Button>
          {onRunTest && (
            <Button variant="ghost" size="icon-xs" onClick={onRunTest} title="Run test">
              <PlayIcon className="size-3" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col">

          <SectionHeader icon={KeyIcon} title="Provider" />

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
                          setSelectedModel(model.name);
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

          <SectionHeader icon={SlidersIcon} title="Model Settings" />

          <div className="p-3 space-y-3">
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

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground/80">Max Tokens</label>
              <Input
                type="number"
                value={maxTokens ?? 2048}
                onChange={(e) => onMaxTokensChange?.(parseInt(e.target.value) || 2048)}
                className="h-7 text-xs"
              />
            </div>
          </div>

          <SectionHeader
            icon={Braces}
            title="Template Variables"
            action={
              parameters.length > 0 ? (
                <Button variant="ghost" size="icon-xs" onClick={handleClear} title="Clear values">
                  <TrashIcon className="size-3" />
                </Button>
              ) : undefined
            }
          />

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
        </div>
      </ScrollArea>
    </div>
  );
}
