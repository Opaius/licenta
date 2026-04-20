"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SaveIcon,
  GitBranchIcon,
  PlayIcon,
  DownloadIcon,
  ShareIcon,
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
}: ToolbarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1 p-2 border-b bg-background">
      <Button
        variant="ghost"
        size="sm"
        onClick={onSave}
        disabled={saved}
      >
        {saved ? (
          <>
            <CheckIcon className="size-4 mr-1 text-green-600" />
            Saved
          </>
        ) : (
          <>
            <SaveIcon className="size-4 mr-1" />
            Save
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
          <span className="max-w-[80px] truncate">{branchName}</span>
        ) : (
          "Branch"
        )}
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button
        variant="default"
        size="sm"
        onClick={onTest}
        disabled={testing}
      >
        <PlayIcon className="size-4 mr-1" />
        {testing ? "Testing..." : "Test"}
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <div className="flex items-center gap-1 ml-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={onExport}
        >
          <DownloadIcon className="size-4 mr-1" />
          Export
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={copied ? undefined : handleCopyLink}
        >
          {copied ? (
            <>
              <CheckIcon className="size-4 mr-1 text-green-600" />
              Copied
            </>
          ) : (
            <>
              <CopyIcon className="size-4 mr-1" />
              Share
            </>
          )}
        </Button>
      </div>
    </div>
  );
}