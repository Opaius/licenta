"use client";

import { useState } from "react";
import Link from "next/link";
import { Layers, Plus, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface Workspace {
  id: string;
  name: string;
  memberCount: number;
  promptsCount: number;
  isPublic: boolean;
}

const mockWorkspaces: Workspace[] = [
  { id: "1", name: "Marketing Team", memberCount: 5, promptsCount: 23, isPublic: true },
  { id: "2", name: "Product Research", memberCount: 3, promptsCount: 12, isPublic: false },
  { id: "3", name: "Support Scripts", memberCount: 8, promptsCount: 45, isPublic: true },
  { id: "4", name: "Internal Tools", memberCount: 2, promptsCount: 7, isPublic: false },
];

interface SidebarProps {
  activeWorkspace?: string;
}

export function Sidebar({ activeWorkspace }: SidebarProps) {
  const [workspaces] = useState<Workspace[]>(mockWorkspaces);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

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
          <DialogTrigger className="w-full">
            <Button size="sm">
              <Plus className="size-4" data-icon="inline-start" />
              New Workspace
            </Button>
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
              <Button onClick={() => setIsCreateOpen(false)}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      <div className="flex flex-1 flex-col overflow-y-auto p-2">
        <div className="mb-2 px-2 text-xs font-medium text-muted-foreground">Workspaces</div>
        <nav className="flex flex-col gap-1">
          {workspaces.map((workspace) => (
            <Link
              key={workspace.id}
              href={`/workspace/${workspace.id}`}
              className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                activeWorkspace === workspace.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground"
              }`}
            >
              {workspace.isPublic ? (
                <Users className="size-4 shrink-0" />
              ) : (
                <Layers className="size-4 shrink-0" />
              )}
              <span className="flex-1 truncate">{workspace.name}</span>
              <span className="text-xs text-muted-foreground">
                {workspace.memberCount}
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