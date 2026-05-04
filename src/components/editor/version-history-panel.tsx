"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronUpIcon, GitBranchIcon, ChevronUp, ChevronDown, FlaskConical, ExternalLinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export interface Version {
  id: string;
  timestamp: Date;
  author: {
    name: string;
    avatar?: string;
  };
  message: string;
  changes: number;
  hasTestRuns: boolean;
  voteScore: number;
  userVote: 1 | -1 | null;
}

interface VersionHistoryPanelProps {
  versions: Version[];
  currentVersionId?: string;
  workspaceId: string;
  promptId: string;
  onRestore?: (versionId: string) => void;
  onVote?: (versionId: string, value: 1 | -1) => void;
}

export function VersionHistoryPanel({
  versions,
  currentVersionId,
  workspaceId,
  promptId,
  onRestore,
  onVote,
}: VersionHistoryPanelProps) {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [now, setNow] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    setNow(Date.now());
  }, []);

  const formatDate = (date: Date) => {
    if (!now) return date.toLocaleDateString();
    const diff = now - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <TooltipProvider>
      <Card className="h-full border-0 shadow-none">
        <CardHeader className="py-3 px-4 border-b">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <GitBranchIcon className="size-4" />
            Version History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100%-44px)]">
            <div className="p-2 space-y-1">
              {versions.map((version, index) => (
                <div key={version.id}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`w-full justify-start h-auto py-2 px-2 ${
                      selectedVersion === version.id ? "bg-muted" : ""
                    }`}
                    onClick={() => setSelectedVersion(version.id)}
                  >
                    <div className="flex flex-col items-start gap-1 w-full">
                      <div className="flex items-center gap-2 w-full">
                        <Avatar className="size-5">
                          <AvatarImage src={version.author.avatar} />
                          <AvatarFallback className="text-[10px]">
                            {version.author.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium truncate">
                          {version.author.name}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatDate(version.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate w-full text-left">
                        {version.message}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground w-full">
                        {version.changes > 0 && <span>{version.changes} changes</span>}
                        {version.changes === 0 && version.message?.toLowerCase().includes("version 1") && (
                          <span className="italic">Initial version</span>
                        )}
                        {version.id === currentVersionId && (
                          <span className="text-primary font-medium">Current</span>
                        )}
                        {!version.hasTestRuns && (
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="flex items-center gap-1 text-amber-500">
                                <FlaskConical className="size-3" />
                                Untested
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Run a test to enable voting</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {version.hasTestRuns && (
                          <span className="flex items-center gap-1 text-green-500">
                            <FlaskConical className="size-3" />
                            Tested
                          </span>
                        )}
                        <div className="ml-auto flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger>
                              <span
                                className={cn(
                                  "p-0.5 rounded hover:bg-muted transition-colors inline-flex",
                                  version.userVote === 1
                                    ? "text-green-600"
                                    : "text-muted-foreground",
                                  !version.hasTestRuns && "opacity-50 cursor-not-allowed"
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (version.hasTestRuns) {
                                    onVote?.(version.id, 1);
                                  }
                                }}
                              >
                                <ChevronUp className="size-3.5" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">
                                {version.hasTestRuns ? "Upvote" : "Test before voting"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                          <span
                            className={cn(
                              "text-xs font-medium min-w-[1rem] text-center",
                              version.voteScore > 0 && "text-green-600",
                              version.voteScore < 0 && "text-red-600",
                              version.voteScore === 0 && "text-muted-foreground"
                            )}
                          >
                            {version.voteScore}
                          </span>
                          <Tooltip>
                            <TooltipTrigger>
                              <span
                                className={cn(
                                  "p-0.5 rounded hover:bg-muted transition-colors inline-flex",
                                  version.userVote === -1
                                    ? "text-red-600"
                                    : "text-muted-foreground",
                                  !version.hasTestRuns && "opacity-50 cursor-not-allowed"
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (version.hasTestRuns) {
                                    onVote?.(version.id, -1);
                                  }
                                }}
                              >
                                <ChevronDown className="size-3.5" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">
                                {version.hasTestRuns ? "Downvote" : "Test before voting"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                      <button
                        className="text-[10px] text-primary hover:underline mt-0.5 flex items-center gap-0.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/workspace/${workspaceId}/prompt/${promptId}/version/${version.id}`);
                        }}
                      >
                        <ExternalLinkIcon className="size-3" />
                        Open version details
                      </button>
                    </div>
                  </Button>
                  {index < versions.length - 1 && (
                    <Separator className="my-1" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          {selectedVersion && selectedVersion !== currentVersionId && (
            <div className="p-2 border-t">
              <Button
                size="sm"
                className="w-full"
                onClick={() => onRestore?.(selectedVersion)}
              >
                <ChevronUpIcon className="size-4 mr-1" />
                Restore this version
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
