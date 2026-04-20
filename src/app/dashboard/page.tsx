"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Plus, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { WorkspaceCard, WorkspaceCardProps } from "@/components/workspace/WorkspaceCard";

interface WorkspaceWithRole {
  _id: string;
  name: string;
  ownerId: string;
  isPublic: boolean;
  createdAt: number;
  role: "owner" | "editor" | "viewer";
}

export default function DashboardPage() {
  const workspaces = useQuery(api.workspaces.listWorkspaces);
  const createWorkspace = useMutation(api.workspaces.createWorkspace);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateWorkspace = async () => {
    setIsCreating(true);
    try {
      await createWorkspace({ 
        name: `Workspace ${Date.now()}`, 
        isPublic: false 
      });
    } catch (error) {
      console.error("Failed to create workspace:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredWorkspaces = (workspaces || []).filter((ws) =>
    ws.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Transform Convex workspace to WorkspaceCardProps
  const workspaceCards: WorkspaceCardProps[] = filteredWorkspaces.map((ws) => ({
    id: ws._id,
    name: ws.name,
    description: ws.isPublic ? "Public workspace" : "Private workspace",
    memberCount: 1,
    promptsCount: 0,
    isPublic: ws.isPublic,
  }));

  return (
    <div className="flex h-full flex-col">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex flex-1 flex-col overflow-y-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">Workspaces</h1>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search workspaces..."
                  className="w-64 pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateWorkspace} disabled={isCreating}>
                <Plus className="size-4" data-icon="inline-start" />
                New Workspace
              </Button>
            </div>
          </div>

          {workspaces === undefined ? (
            <div className="flex flex-1 items-center justify-center py-24">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredWorkspaces.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                <Search className="size-8 text-muted-foreground" />
              </div>
              <h2 className="mb-2 text-lg font-semibold">No workspaces found</h2>
              <p className="mb-6 max-w-sm text-muted-foreground">
                {searchQuery
                  ? `No workspaces matching "${searchQuery}"`
                  : "Get started by creating your first workspace"}
              </p>
              {!searchQuery && (
                <Button onClick={handleCreateWorkspace} disabled={isCreating}>
                  {isCreating ? (
                    <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                  ) : (
                    <Plus className="size-4" data-icon="inline-start" />
                  )}
                  Create Workspace
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {workspaceCards.map((workspace) => (
                <WorkspaceCard key={workspace.id} {...workspace} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}