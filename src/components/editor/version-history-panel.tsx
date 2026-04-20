"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChevronUpIcon, GitBranchIcon, UserIcon } from "lucide-react";

export interface Version {
  id: string;
  timestamp: Date;
  author: {
    name: string;
    avatar?: string;
  };
  message: string;
  changes: number;
}

interface VersionHistoryPanelProps {
  versions: Version[];
  currentVersionId?: string;
  onRestore?: (versionId: string) => void;
}

export function VersionHistoryPanel({
  versions,
  currentVersionId,
  onRestore,
}: VersionHistoryPanelProps) {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
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
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{version.changes} changes</span>
                      {version.id === currentVersionId && (
                        <span className="text-primary font-medium">Current</span>
                      )}
                    </div>
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
  );
}
