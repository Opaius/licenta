"use client";

import { useState } from "react";
import Link from "next/link";
import { Layers, Plus, Settings, Users, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface SidebarProps {
  activeWorkspace?: string;
}

export function Sidebar({ activeWorkspace }: SidebarProps) {
  const workspaces = useQuery(api.workspaces.listWorkspaces);
  const createWorkspace = useMutation(api.workspaces.createWorkspace);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

const handleCreateWorkspace = async () => {
  if (!newWorkspaceName.trim()) return;
  
  setIsCreating(true);
  try {
    await createWorkspace({
      name: newWorkspaceName.trim(),
      isPublic: false,
    });
    setNewWorkspaceName("");
    setIsCreateOpen(false);
    toast.success("Workspace created successfully!");
  } catch (error) {
    console.error("Failed to create workspace:", error);
    const err = error instanceof Error ? error : new Error("Failed to create workspace");
    toast.error(err.message);
  } finally {
    setIsCreating(false);
  }
};

  if (workspaces === undefined) {
    return (
      <aside className="flex w-64 flex-col border-r border-border bg-sidebar shrink-0">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary">
            <Layers className="size-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sidebar-foreground">Stratum</span>
        </div>
        
        <div className="flex-1 p-4">
          <div className="space-y-3">
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-8 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex w-64 flex-col border-r border-border bg-sidebar shrink-0">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary">
          <Layers className="size-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-sidebar-foreground">Stratum</span>
      </div>

      <div className="p-3">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger className={buttonVariants({ size: "sm", className: "w-full justify-start gap-2" })}>
            <Plus className="size-4" data-icon="inline-start" />
            New Workspace
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Workspace</DialogTitle>
              <DialogDescription>
                Invite your team to collaborate on prompts together.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Workspace Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Marketing Team"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateWorkspace} 
                disabled={isCreating || !newWorkspaceName.trim()}
              >
                {isCreating && <Loader2 className="size-4 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      <div className="flex flex-1 flex-col overflow-y-auto p-2">
        <div className="mb-2 px-2 text-xs font-medium text-muted-foreground">Workspaces</div>
        <nav className="flex flex-col gap-0.5">
          {workspaces.map((workspace) => (
            <Link
              key={workspace._id}
              href={`/workspace/${workspace._id}`}
              aria-current={activeWorkspace === workspace._id ? "page" : undefined}
              className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-200 hover:bg-sidebar-accent/60 hover:translate-x-0.5 focus-visible:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sidebar-ring ${
                activeWorkspace === workspace._id
                  ? "bg-sidebar-accent/80 text-sidebar-accent-foreground font-medium shadow-sm"
                  : "text-sidebar-foreground/80 hover:text-sidebar-foreground"
              }`}
            >
              <div className={`flex size-5 items-center justify-center rounded ${workspace.isPublic ? 'text-primary' : ''}`}>
                {workspace.isPublic ? (
                  <Users className="size-3.5 shrink-0" />
                ) : (
                  <Layers className="size-3.5 shrink-0" />
                )}
              </div>
              <span className="flex-1 truncate">{workspace.name}</span>
              <span className="text-[10px] text-muted-foreground/70 group-hover:text-muted-foreground transition-colors tabular-nums">
                {workspace.memberCount || 0}
              </span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-border p-2">
        <Link
          href="/settings"
          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Settings className="size-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
}