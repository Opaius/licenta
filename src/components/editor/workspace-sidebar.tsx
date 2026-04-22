"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  FolderIcon,
  FileIcon,
  PlusIcon,
  SearchIcon,
  UsersIcon,
  LockIcon,
  PencilIcon,
  CheckIcon,
  XIcon,
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
  onRenamePrompt?: (promptId: string, newName: string) => void;
  onRenameWorkspace?: (workspaceId: string, newName: string) => void;
}

export function WorkspaceSidebar({
  workspaces,
  activeWorkspaceId,
  activePromptId,
  onSelectPrompt,
  onCreatePrompt,
  onCreateWorkspace,
  onRenamePrompt,
  onRenameWorkspace,
}: WorkspaceSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(
    new Set([activeWorkspaceId || workspaces[0]?.id].filter(Boolean))
  );
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const promptInputRef = useRef<HTMLInputElement>(null);
  const workspaceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingPromptId && promptInputRef.current) {
      promptInputRef.current.focus();
      promptInputRef.current.select();
    }
  }, [editingPromptId]);

  useEffect(() => {
    if (editingWorkspaceId && workspaceInputRef.current) {
      workspaceInputRef.current.focus();
      workspaceInputRef.current.select();
    }
  }, [editingWorkspaceId]);

  const toggleWorkspace = (id: string) => {
    const newExpanded = new Set(expandedWorkspaces);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedWorkspaces(newExpanded);
  };

  const startRenamePrompt = (prompt: PromptItem) => {
    setEditingPromptId(prompt.id);
    setEditValue(prompt.name);
  };

  const commitRenamePrompt = () => {
    if (editingPromptId && editValue.trim()) {
      onRenamePrompt?.(editingPromptId, editValue.trim());
    }
    setEditingPromptId(null);
    setEditValue("");
  };

  const cancelRenamePrompt = () => {
    setEditingPromptId(null);
    setEditValue("");
  };

  const startRenameWorkspace = (workspace: WorkspaceItem) => {
    setEditingWorkspaceId(workspace.id);
    setEditValue(workspace.name);
  };

  const commitRenameWorkspace = () => {
    if (editingWorkspaceId && editValue.trim()) {
      onRenameWorkspace?.(editingWorkspaceId, editValue.trim());
    }
    setEditingWorkspaceId(null);
    setEditValue("");
  };

  const cancelRenameWorkspace = () => {
    setEditingWorkspaceId(null);
    setEditValue("");
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
              <div
                role="button"
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-muted cursor-pointer group"
                onClick={() => toggleWorkspace(workspace.id)}
              >
                <FolderIcon
                  className={cn(
                    "size-4 transition-transform shrink-0",
                    expandedWorkspaces.has(workspace.id) && "rotate-90"
                  )}
                />
                {editingWorkspaceId === workspace.id ? (
                  <div className="flex-1 flex items-center gap-1 min-w-0">
                    <Input
                      ref={workspaceInputRef}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRenameWorkspace();
                        if (e.key === "Escape") cancelRenameWorkspace();
                      }}
                      onBlur={commitRenameWorkspace}
                      className="h-6 text-xs py-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                ) : (
                  <span className="flex-1 truncate text-left">{workspace.name}</span>
                )}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      startRenameWorkspace(workspace);
                    }}
                  >
                    <PencilIcon className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreatePrompt?.(workspace.id);
                    }}
                  >
                    <PlusIcon className="size-3" />
                  </Button>
                </div>
              </div>

              {expandedWorkspaces.has(workspace.id) && (
                <div className="ml-4 mt-1 space-y-0.5">
                  {workspace.prompts.map((prompt) => (
                    <div
                      key={prompt.id}
                      className={cn(
                        "flex items-center gap-1 rounded-md px-1 py-0.5 group",
                        activePromptId === prompt.id && "bg-muted"
                      )}
                    >
                      <div
                        role="button"
                        className="flex flex-1 items-center gap-2 h-8 pl-2 rounded-md cursor-pointer hover:bg-muted/50 min-w-0"
                        onClick={() => onSelectPrompt?.(workspace.id, prompt.id)}
                      >
                        <FileIcon className="size-4 text-muted-foreground shrink-0" />
                        {editingPromptId === prompt.id ? (
                          <Input
                            ref={promptInputRef}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitRenamePrompt();
                              if (e.key === "Escape") cancelRenamePrompt();
                            }}
                            onBlur={commitRenamePrompt}
                            className="h-6 text-xs py-0"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="truncate text-left text-sm">{prompt.name}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            startRenamePrompt(prompt);
                          }}
                        >
                          <PencilIcon className="size-3" />
                        </Button>
                        {prompt.sharedWith && prompt.sharedWith > 0 ? (
                          <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                            <UsersIcon className="size-3" />
                            <span>{prompt.sharedWith}</span>
                          </div>
                        ) : (
                          <LockIcon className="size-3 text-muted-foreground" />
                        )}
                      </div>
                    </div>
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
