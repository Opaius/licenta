"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  FolderIcon,
  FileIcon,
  PlusIcon,
  SearchIcon,
  MoreHorizontalIcon,
  UsersIcon,
  LockIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface PromptItem {
  id: string;
  name: string;
  icon?: string;
  updatedAt: Date;
  author?: {
    name: string;
    avatar?: string;
  };
  sharedWith?: number;
}

export interface WorkspaceItem {
  id: string;
  name: string;
  icon?: string;
  prompts: PromptItem[];
}

interface WorkspaceSidebarProps {
  workspaces: WorkspaceItem[];
  activeWorkspaceId?: string;
  activePromptId?: string;
  onSelectPrompt?: (workspaceId: string, promptId: string) => void;
  onCreatePrompt?: (workspaceId: string) => void;
  onCreateWorkspace?: () => void;
}

export function WorkspaceSidebar({
  workspaces,
  activeWorkspaceId,
  activePromptId,
  onSelectPrompt,
  onCreatePrompt,
  onCreateWorkspace,
}: WorkspaceSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(
    new Set([activeWorkspaceId || workspaces[0]?.id].filter(Boolean))
  );

  const toggleWorkspace = (id: string) => {
    const newExpanded = new Set(expandedWorkspaces);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedWorkspaces(newExpanded);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) return "today";
    if (days === 1) return "yesterday";
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full bg-sidebar border-r">
      <div className="p-3 border-b">
        <div className="relative">
          <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search prompts..."
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-input bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {workspaces.map((workspace) => (
            <div key={workspace.id} className="mb-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => toggleWorkspace(workspace.id)}
              >
                <FolderIcon
                  className={cn(
                    "size-4 transition-transform",
                    expandedWorkspaces.has(workspace.id) && "rotate-90"
                  )}
                />
                <span className="flex-1 truncate text-left">{workspace.name}</span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreatePrompt?.(workspace.id);
                  }}
                >
                  <PlusIcon className="size-3" />
                </Button>
              </Button>

              {expandedWorkspaces.has(workspace.id) && (
                <div className="ml-4 mt-1 space-y-0.5">
                  {workspace.prompts.map((prompt) => (
                    <Button
                      key={prompt.id}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full justify-start gap-2 h-8 pl-2",
                        activePromptId === prompt.id && "bg-muted"
                      )}
                      onClick={() => onSelectPrompt?.(workspace.id, prompt.id)}
                    >
                      <FileIcon className="size-4 text-muted-foreground" />
                      <span className="flex-1 truncate text-left text-sm">
                        {prompt.name}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                        {prompt.sharedWith && prompt.sharedWith > 0 ? (
                          <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                            <UsersIcon className="size-3" />
                            <span>{prompt.sharedWith}</span>
                          </div>
                        ) : (
                          <LockIcon className="size-3 text-muted-foreground" />
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-2 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={onCreateWorkspace}
        >
          <PlusIcon className="size-4" />
          <span>New Workspace</span>
        </Button>
      </div>
    </div>
  );
}