"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SaveIcon,
  GitBranchIcon,
  PlayIcon,
  DownloadIcon,
  CopyIcon,
  CheckIcon,
} from "lucide-react";
import { useState } from "react";

interface ToolbarProps {
  onSave?: () => void;
  onBranch?: () => void;
  onTest?: () => void;
  onExport?: () => void;
  onShare?: () => void;
  saved?: boolean;
  testing?: boolean;
  branchName?: string;
  canTest?: boolean;
}

export function Toolbar({
  onSave,
  onBranch,
  onTest,
  onExport,
  onShare,
  saved = false,
  testing = false,
  branchName,
  canTest = true,
}: ToolbarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1 p-2 border-b bg-background min-w-0">
      <Button
        variant="ghost"
        size="sm"
        onClick={onSave}
        disabled={saved}
      >
        {saved ? (
          <>
            <CheckIcon className="size-4 mr-1 text-green-600" />
            <span className="hidden sm:inline">Saved</span>
          </>
        ) : (
          <>
            <SaveIcon className="size-4 mr-1" />
            <span className="hidden sm:inline">Save</span>
          </>
        )}
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button
        variant="ghost"
        size="sm"
        onClick={onBranch}
      >
        <GitBranchIcon className="size-4 mr-1" />
        {branchName ? (
          <span className="max-w-[80px] truncate hidden sm:inline">{branchName}</span>
        ) : (
          <span className="hidden sm:inline">Branch</span>
        )}
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button
        variant="default"
        size="sm"
        onClick={onTest}
        disabled={testing || !canTest}
        title={!canTest ? "Select an API key and model to test" : undefined}
      >
        <PlayIcon className="size-4 mr-1" />
        <span className="hidden sm:inline">{testing ? "Testing..." : "Test"}</span>
      </Button>

      <div className="flex items-center gap-1 ml-auto shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onExport}
          className="shrink-0"
        >
          <DownloadIcon className="size-4 mr-1" />
          <span className="hidden sm:inline">Export</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={copied ? undefined : handleCopyLink}
          className="shrink-0"
        >
          {copied ? (
            <>
              <CheckIcon className="size-4 mr-1 text-green-600" />
              <span className="hidden sm:inline">Copied</span>
            </>
          ) : (
            <>
              <CopyIcon className="size-4 mr-1" />
              <span className="hidden sm:inline">Share</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
