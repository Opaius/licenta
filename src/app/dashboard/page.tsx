"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { api } from "@convex/_generated/api";
import { Skeleton as BoneSkeleton } from "boneyard-js/react";
import { Plus, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { WorkspaceCard, WorkspaceCardProps } from "@/components/workspace/WorkspaceCard";
import { toast } from "sonner";

interface WorkspaceWithRole {
  _id: string;
  name: string;
  ownerId: string;
  isPublic: boolean;
  createdAt: number;
  role: "owner" | "editor" | "viewer";
  memberCount: number;
  promptsCount: number;
}

// Fixture for boneyard capture – shows a grid of placeholder cards
function DashboardFixture() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="flex flex-col">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-4 w-3/4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Simple fallback while bones not generated
function DashboardFallback() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <span className="text-muted-foreground">Loading…</span>
    </div>
  );
}

function RedirectToAuth() {
  const router = useRouter();
  useEffect(() => {
    router.push("/auth");
  }, [router]);
  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  );
}

function DashboardContent() {
  const workspaces = useQuery(api.workspaces.listWorkspaces);
  const createWorkspace = useMutation(api.workspaces.createWorkspace);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateWorkspace = async () => {
    setIsCreating(true);
    try {
      await createWorkspace({
        name: `Workspace ${Date.now()}`,
        isPublic: false,
      });
      toast.success("Workspace created successfully!");
    } catch (error) {
      console.error("Failed to create workspace:", error);
      const err = error instanceof Error ? error : new Error("Failed to create workspace");
      toast.error(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  // Apply WorkspaceWithRole typing for better type safety
  const typedWorkspaces = (workspaces || []) as WorkspaceWithRole[];
  const filteredWorkspaces = typedWorkspaces.filter((ws) =>
    ws.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Transform Convex workspace to WorkspaceCardProps
  const workspaceCards: WorkspaceCardProps[] = filteredWorkspaces.map((ws) => ({
    id: ws._id,
    name: ws.name,
    description: ws.isPublic ? "Public workspace" : "Private workspace",
    memberCount: ws.memberCount || 0,
    promptsCount: ws.promptsCount || 0,
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

          <BoneSkeleton
            name="dashboard-grid"
            loading={workspaces === undefined}
            fixture={<DashboardFixture />}
            fallback={<DashboardFallback />}
          >
            {workspaces !== undefined && (
              <>
                {filteredWorkspaces.length === 0 ? (
<div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
  <div className="mb-5 flex size-20 items-center justify-center rounded-2xl bg-muted/40">
    <Search className="size-10 text-muted-foreground/70" />
  </div>
  <h2 className="mb-2.5 text-xl font-semibold">No workspaces found</h2>
  <p className="mb-8 max-w-md text-muted-foreground/80">
    {searchQuery
      ? `No workspaces matching "${searchQuery}"`
      : "Get started by creating your first workspace"}
  </p>
  {!searchQuery && (
    <Button onClick={handleCreateWorkspace} size="lg" disabled={isCreating}>
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
<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {workspaceCards.map((workspace) => (
    <WorkspaceCard key={workspace.id} {...workspace} />
  ))}
</div>
                )}
              </>
            )}
          </BoneSkeleton>
        </main>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <>
      <AuthLoading>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </AuthLoading>
      <Unauthenticated>
        <RedirectToAuth />
      </Unauthenticated>
      <Authenticated>
        <DashboardContent />
      </Authenticated>
    </>
  );
}
