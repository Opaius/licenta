"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  GitForkIcon,
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

export interface WorkspaceMember {
  userId: string;
  role: "owner" | "editor" | "viewer";
  joinedAt: number;
  name?: string;
  email?: string;
}

interface WorkspaceSidebarProps {
  workspaces: WorkspaceItem[];
  activeWorkspaceId?: string;
  activePromptId?: string;
  members?: WorkspaceMember[];
  onSelectPrompt?: (workspaceId: string, promptId: string) => void;
  onCreatePrompt?: (workspaceId: string) => void;
  onCreateWorkspace?: () => void;
  onRenamePrompt?: (promptId: string, newName: string) => void;
  onRenameWorkspace?: (workspaceId: string, newName: string) => void;
  onForkPrompt?: (promptId: string) => void;
}

export function WorkspaceSidebar({
  workspaces,
  activeWorkspaceId,
  activePromptId,
  members = [],
  onSelectPrompt,
  onCreatePrompt,
  onCreateWorkspace,
  onRenamePrompt,
  onRenameWorkspace,
  onForkPrompt,
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

  const [now, setNow] = useState<number>(0);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  const formatDate = (date: Date) => {
    if (!now) return date.toLocaleDateString();
    const diff = now - date.getTime();
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
                          title="Fork prompt"
                          onClick={(e) => {
                            e.stopPropagation();
                            onForkPrompt?.(prompt.id);
                          }}
                        >
                          <GitForkIcon className="size-3" />
                        </Button>
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

      {members.length > 0 && (
        <div className="border-t p-3">
          <div className="flex items-center gap-2 mb-2">
            <UsersIcon className="size-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase">Members</span>
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5 ml-auto">
              {members.length}
            </Badge>
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {members.slice(0, 5).map((member) => (
              <div key={member.userId} className="flex items-center gap-2">
                <div className="relative">
                  <Avatar className="size-6">
                    <AvatarFallback className="text-xs">
                      {member.name?.slice(0, 2).toUpperCase() || member.userId.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-green-500 border-2 bg-background" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate">{member.name || member.email?.split("@")[0] || "User"}</p>
                  <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                </div>
              </div>
            ))}
            {members.length > 5 && (
              <p className="text-xs text-muted-foreground pl-8">+{members.length - 5} more</p>
            )}
          </div>
        </div>
      )}

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
