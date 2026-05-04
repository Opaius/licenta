"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  TerminalIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  ClockIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface TestResult {
  id: string;
  name: string;
  status: "passed" | "failed" | "running" | "pending";
  duration?: number;
  error?: string;
  output?: string;
}

interface TestResultsPanelProps {
  results: TestResult[];
  isRunning?: boolean;
}

export function TestResultsPanel({
  results,
  isRunning = false,
}: TestResultsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);

  const passedCount = results.filter((r) => r.status === "passed").length;
  const failedCount = results.filter((r) => r.status === "failed").length;
  const runningCount = results.filter((r) => r.status === "running").length;

  return (
    <div
      className={cn(
        "border-t bg-background transition-all",
        isExpanded ? "h-64" : "h-10"
      )}
    >
      <div className="flex items-center justify-between px-4 h-10 border-b">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-6 w-6"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDownIcon className="size-4" />
            ) : (
              <ChevronUpIcon className="size-4" />
            )}
          </Button>
          <TerminalIcon className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">Test Results</span>
          {results.length > 0 && (
            <div className="flex items-center gap-2 ml-2">
              <Badge variant="secondary" className="text-xs">
                {passedCount} passed
              </Badge>
              {failedCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {failedCount} failed
                </Badge>
              )}
              {runningCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  {runningCount} running
                </Badge>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isRunning && (
            <Badge variant="outline" className="text-xs animate-pulse">
              <ClockIcon className="size-3 mr-1" />
              Running...
            </Badge>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="flex h-[calc(100%-40px)]">
          <div className="w-48 border-r overflow-auto">
            <div className="p-2 space-y-1">
              {results.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No tests run yet
                </p>
              ) : (
                results.map((result) => (
                  <button
                    key={result.id}
                    className={cn(
                      "w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2",
                      selectedResult === result.id
                        ? "bg-muted"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => setSelectedResult(result.id)}
                  >
                    {result.status === "passed" && (
                      <CheckCircleIcon className="size-4 text-green-600" />
                    )}
                    {result.status === "failed" && (
                      <XCircleIcon className="size-4 text-red-600" />
                    )}
                    {result.status === "running" && (
                      <ClockIcon className="size-4 text-yellow-600 animate-spin" />
                    )}
                    {result.status === "pending" && (
                      <ClockIcon className="size-4 text-muted-foreground" />
                    )}
                    <span className="truncate">{result.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex-1">
            {selectedResult ? (
              <ScrollArea className="h-full">
                <div className="p-4">
                  {(() => {
                    const result = results.find(
                      (r) => r.id === selectedResult
                    );
                    if (!result) return null;

                    return (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{result.name}</span>
                          {result.status === "passed" && (
                            <Badge variant="secondary">Passed</Badge>
                          )}
                          {result.status === "failed" && (
                            <Badge variant="destructive">Failed</Badge>
                          )}
                          {result.duration && (
                            <span className="text-xs text-muted-foreground">
                              {result.duration}ms
                            </span>
                          )}
                        </div>
                        {result.error && (
                          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm font-mono">
                            {result.error}
                          </div>
                        )}
                        {result.output && (
                          <pre className="p-3 rounded-lg bg-muted text-sm font-mono whitespace-pre-wrap">
                            {result.output}
                          </pre>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a test to view details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}