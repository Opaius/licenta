"use client";

import { useState, useEffect, use } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Skeleton as BoneSkeleton } from "boneyard-js/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UsersIcon,
  MessageSquareIcon,
  GitBranchIcon,
  LogOut,
  Settings,
  ChevronRightIcon,
  HomeIcon,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { WorkspaceSidebar, type WorkspaceItem } from "@/components/editor/workspace-sidebar";
import { PromptEditor } from "@/components/editor/prompt-editor";
import { ParametersPanel } from "@/components/editor/parameters-panel";
import { VersionHistoryPanel } from "@/components/editor/version-history-panel";
import { ChatPanel } from "@/components/editor/chat-panel";
import { Toolbar } from "@/components/editor/editor-toolbar";
import { TestResultsPanel, type TestResult } from "@/components/editor/test-results-panel";
import type { ModelSetting } from "@/components/editor/parameters-panel";

export default function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const workspaceId = id as Id<"workspaces">;
  const router = useRouter();

  const workspace = useQuery(api.workspaces.getWorkspace, { workspaceId });
  const allWorkspaces = useQuery(api.workspaces.listWorkspaces, {});
  const prompts = useQuery(api.prompts.listPrompts, { workspaceId });
  const currentUser = useQuery(api.auth.getCurrentUser);

  const [selectedPromptId, setSelectedPromptId] = useState<Id<"prompts"> | null>(null);

  useEffect(() => {
    if (prompts?.length && !selectedPromptId) setSelectedPromptId(prompts[0]._id);
  }, [prompts, selectedPromptId]);

  const promptDetail = useQuery(api.prompts.getPrompt, selectedPromptId ? { promptId: selectedPromptId } : "skip");
  const versions = useQuery(api.prompts.getPromptVersions, selectedPromptId ? { promptId: selectedPromptId } : "skip");
  const chatMessages = useQuery(api.comments.getChat, selectedPromptId ? { promptId: selectedPromptId } : "skip");
  const userVotesData = useQuery(api.voting.getUserVotesForPrompt, selectedPromptId ? { promptId: selectedPromptId } : "skip");
  const testRuns = useQuery(api.testRuns.listTestRuns, selectedPromptId ? { promptId: selectedPromptId } : "skip");
  const members = useQuery(api.workspaceMembers.listMembers, { workspaceId });
  const activityFeed = useQuery(api.prompts.getActivityFeed, { workspaceId, limit: 10 });

  const apiKeys = useQuery(api.apiKeys.listApiKeys, { workspaceId });
  const [selectedKeyId, setSelectedKeyId] = useState<string | undefined>();
  const models = useQuery(api.apiKeys.listModels, selectedKeyId ? { keyId: selectedKeyId as Id<"apiKeys"> } : "skip");

  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [selectedModel, setSelectedModel] = useState("");

  const updatePrompt = useMutation(api.prompts.updatePrompt);
  const updatePromptTitle = useMutation(api.prompts.updatePromptTitle);
  const updateWorkspaceName = useMutation(api.workspaces.updateWorkspace);
  const createPrompt = useMutation(api.prompts.createPrompt);
  const forkPrompt = useMutation(api.prompts.forkPrompt);
  const voteMutation = useMutation(api.voting.voteVersion);
  const addChatMessageMutation = useMutation(api.comments.addChatMessage);
  const restoreVersionMutation = useMutation(api.prompts.restoreVersion);
  const runTestMutation = useMutation(api.testRuns.runTest);

  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [activeTab, setActiveTab] = useState("versions");
  const [testValues, setTestValues] = useState<Record<string, string>>({});
  const [modelSettings, setModelSettings] = useState<ModelSetting[]>([]);

  useEffect(() => { if (promptDetail) { setContent(promptDetail.content); setSaved(true); } }, [promptDetail]);

  useEffect(() => {
    if (testRuns?.length) {
      const latest = testRuns[0];
      setTestResults((latest.results || []).map((r: any, idx: number) => ({
        id: `${latest._id}-${idx}`, name: `${r.provider}/${r.model}`, status: r.error ? "failed" : "passed",
        duration: r.latency, error: r.error, output: r.response,
      })));
    } else {
      setTestResults([]);
    }
  }, [testRuns]);

  // Auto-save with debounce
  useEffect(() => {
    if (!selectedPromptId || saved) return;
    const timer = setTimeout(() => {
      handleSave();
    }, 2000);
    return () => clearTimeout(timer);
  }, [content, selectedPromptId, saved]);

  // Prevent reload if unsaved
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!saved) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [saved]);

  const handleSave = async () => { if (!selectedPromptId) return; await updatePrompt({ promptId: selectedPromptId, content }); setSaved(true); };
  const handleTest = async () => {
    if (!selectedPromptId || !selectedKeyId || !selectedModel) return;
    setTesting(true);
    try {
      const extraSettings: Record<string, string> = {};
      for (const s of modelSettings) {
        extraSettings[s.key] = String(s.value);
      }
      await runTestMutation({
        promptId: selectedPromptId,
        keyId: selectedKeyId as Id<"apiKeys">,
        model: selectedModel,
        temperature,
        maxTokens,
        testValues,
        extraSettings,
      });
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Test failed");
    } finally {
      setTesting(false);
    }
  };
  const handleExport = () => { if (!content) return; const blob = new Blob([content], { type: "text/plain" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "prompt.txt"; a.click(); URL.revokeObjectURL(url); };
  const handleVoteVersion = async (versionId: string, value: 1 | -1) => {
    try {
      await voteMutation({ versionId: versionId as Id<"promptVersions">, value });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Vote failed");
    }
  };
  const handleSendChatMessage = (content: string) => {
    if (!selectedPromptId) return;
    addChatMessageMutation({ promptId: selectedPromptId, content });
  };
  const handleRestoreVersion = (versionId: string) => { if (!selectedPromptId) return; restoreVersionMutation({ promptId: selectedPromptId, versionId: versionId as Id<"promptVersions"> }); };
  const handleCreatePrompt = async (wsId: string) => { const result = await createPrompt({ workspaceId: wsId as Id<"workspaces">, title: "New Prompt", content: "" }); if (result?.promptId) setSelectedPromptId(result.promptId); };
  const handleForkPrompt = async (promptId: string) => { const result = await forkPrompt({ promptId: promptId as Id<"prompts">, targetWorkspaceId: workspaceId }); if (result?.promptId) { setSelectedPromptId(result.promptId); toast.success(`Forked as "${result.title}"`); } };
  const handleRenamePrompt = async (promptId: string, newName: string) => { await updatePromptTitle({ promptId: promptId as Id<"prompts">, title: newName }); };
  const handleRenameWorkspace = async (wsId: string, newName: string) => { await updateWorkspaceName({ workspaceId: wsId as Id<"workspaces">, name: newName }); };

  const sidebarWorkspaces: WorkspaceItem[] = (allWorkspaces ?? []).map((ws) => ({
    id: ws._id, name: ws.name,
    prompts: ws._id === workspaceId ? (prompts ?? []).map((p) => ({ id: p._id, name: p.title, updatedAt: new Date(p.createdAt) })) : [],
  }));

  const isMainLoading = Boolean(selectedPromptId && !promptDetail);

  const displayName = (currentUser as any)?.name || (currentUser as any)?.email?.split("@")[0] || "User";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  const userVoteMap = new Map<string, 1 | -1>();
  for (const v of (userVotesData ?? [])) {
    if (v.versionId) {
      userVoteMap.set(v.versionId, v.value);
    }
  }

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      {/* Workspace Header */}
      <header className="flex h-12 items-center justify-between border-b border-border bg-background px-4 shrink-0">
        <div className="flex items-center gap-2 text-sm min-w-0">
          <button onClick={() => router.push("/dashboard")} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <HomeIcon className="size-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <ChevronRightIcon className="size-3 text-muted-foreground shrink-0" />
          <span className="font-medium truncate">{workspace?.name ?? "Workspace"}</span>
          {promptDetail && (
            <>
              <ChevronRightIcon className="size-3 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground truncate">{promptDetail.title}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 h-8 px-2 rounded-md hover:bg-muted transition-colors">
              <div className="size-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium">
                {initials}
              </div>
              <span className="hidden sm:inline text-xs">{displayName}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{(currentUser as any)?.email ?? ""}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/debug-settings")}>
                <Settings className="mr-2 size-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={async () => {
                  await authClient.signOut();
                  router.push("/auth");
                }}
              >
                <LogOut className="mr-2 size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <ResizablePanelGroup direction="horizontal" className="flex-1 w-full">
        {/* Sidebar */}
        <ResizablePanel defaultSize={16} minSize={10} maxSize={30}>
          <BoneSkeleton
            name="sidebar"
            loading={allWorkspaces === undefined}
            fallback={
              <div className="p-2 space-y-2">
                <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-8 w-1/2 bg-muted rounded animate-pulse" />
                <div className="h-8 w-2/3 bg-muted rounded animate-pulse" />
              </div>
            }
          >
            <WorkspaceSidebar
              workspaces={sidebarWorkspaces}
              activeWorkspaceId={workspaceId}
              activePromptId={selectedPromptId ?? undefined}
              members={(members ?? []).map(m => ({ userId: m.userId, role: m.role, joinedAt: m.joinedAt, name: m.name }))}
              onSelectPrompt={(_, promptId) => setSelectedPromptId(promptId as Id<"prompts">)}
              onCreatePrompt={handleCreatePrompt}
              onRenamePrompt={handleRenamePrompt}
              onRenameWorkspace={handleRenameWorkspace}
              onForkPrompt={handleForkPrompt}
            />
          </BoneSkeleton>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Parameters */}
        <ResizablePanel defaultSize={18} minSize={12} maxSize={35}>
          <ParametersPanel
            workspaceId={workspaceId}
            content={content}
            testValues={testValues}
            onTestValuesChange={setTestValues}
            apiKeys={apiKeys}
            selectedKeyId={selectedKeyId}
            onKeyChange={setSelectedKeyId}
            models={models ?? []}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            onTemperatureChange={setTemperature}
            onMaxTokensChange={setMaxTokens}
            temperature={temperature}
            maxTokens={maxTokens}
            modelSettings={modelSettings}
            onModelSettingsChange={setModelSettings}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Editor area */}
        <ResizablePanel defaultSize={41} minSize={15} maxSize={75}>
          <div className="flex flex-col h-full min-w-0 overflow-hidden">
            <Toolbar onSave={handleSave} onBranch={() => {}} onTest={handleTest} onExport={handleExport} onShare={() => {}} saved={saved} testing={testing} branchName="main" canTest={Boolean(selectedKeyId && selectedModel)} />

            {isMainLoading ? (
              <div className="flex items-center justify-center flex-1"><span className="text-muted-foreground">Loading…</span></div>
            ) : selectedPromptId && promptDetail ? (
              <>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <PromptEditor
                    value={content}
                    onChange={(v) => { setContent(v); setSaved(false); }}
                    onCursorChange={(line, column) => setCursorPosition({ line, column })}
                  />
                </div>
                <TestResultsPanel results={testResults} isRunning={testing} />
                <div className="flex items-center justify-between px-3 py-1.5 border-t text-xs text-muted-foreground bg-muted/30 shrink-0 min-w-0">
                  <div className="flex items-center gap-3 truncate">
                    <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
                    <span className="hidden md:inline">Prompt Template</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <UsersIcon className="size-3" />
                    <span>1</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground gap-4">
                <p>Select a prompt or create a new one</p>
                <Button onClick={() => { if (workspaceId) handleCreatePrompt(workspaceId); }}>Create Prompt</Button>
              </div>
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right panel */}
        <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
          <div className="h-full border-l flex flex-col">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
              <TabsList className="w-full rounded-none border-b">
                <TabsTrigger value="versions" className="flex-1 gap-1"><GitBranchIcon className="size-3" />Versions</TabsTrigger>
                <TabsTrigger value="chat" className="flex-1 gap-1"><MessageSquareIcon className="size-3" />Chat</TabsTrigger>
              </TabsList>

              <TabsContent value="versions" className="flex-1 m-0 p-0">
                <VersionHistoryPanel
                  versions={(versions ?? []).map((v) => ({
                    id: v._id,
                    timestamp: new Date(v.createdAt),
                    author: { name: v.authorName || "Unknown" },
                    message: v.version === 1 ? "Initial version" : `Version ${v.version}`,
                    changes: v.changes ?? 0,
                    hasTestRuns: (v as any).hasTestRuns ?? false,
                    voteScore: (v as any).voteScore ?? 0,
                    userVote: userVoteMap.get(v._id) ?? null,
                  }))}
                  currentVersionId={promptDetail?.currentVersion?.toString()}
                  workspaceId={workspaceId}
                  promptId={selectedPromptId ?? ""}
                  onRestore={handleRestoreVersion}
                  onVote={handleVoteVersion}
                />
              </TabsContent>

              <TabsContent value="chat" className="flex-1 m-0 p-0">
                <ChatPanel
                  messages={(chatMessages ?? []).map((m) => ({ id: m._id, author: { name: m.authorName || "Unknown" }, content: m.content, timestamp: new Date(m.createdAt) }))}
                  onSendMessage={handleSendChatMessage}
                />
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
