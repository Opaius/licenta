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
import { Separator } from "@/components/ui/separator";
import {
  UsersIcon,
  MessageSquareIcon,
  GitBranchIcon,
  SparklesIcon,
} from "lucide-react";

import { WorkspaceSidebar, type WorkspaceItem } from "@/components/editor/workspace-sidebar";
import { PromptEditor } from "@/components/editor/prompt-editor";
import { ParametersPanel } from "@/components/editor/parameters-panel";
import { VersionHistoryPanel, type Version } from "@/components/editor/version-history-panel";
import { CommentsPanel, type Comment } from "@/components/editor/comments-panel";
import { VotingControls } from "@/components/editor/voting-controls";
import { Toolbar } from "@/components/editor/editor-toolbar";
import { TestResultsPanel, type TestResult } from "@/components/editor/test-results-panel";

const DEMO_WORKSPACES: WorkspaceItem[] = [
  {
    id: "demo-workspace",
    name: "My Prompts",
    prompts: [
      { id: "prompt-1", name: "Customer Support Agent", updatedAt: new Date(Date.now() - 3600000), author: { name: "Alice" }, sharedWith: 2 },
      { id: "prompt-2", name: "Code Reviewer", updatedAt: new Date(Date.now() - 7200000), author: { name: "Bob" } },
      { id: "prompt-3", name: "Summarizer", updatedAt: new Date(Date.now() - 86400000), author: { name: "Alice" }, sharedWith: 1 },
    ],
  },
  {
    id: "shared-workspace",
    name: "Team Prompts",
    prompts: [
      { id: "prompt-4", name: "Q&A Generator", updatedAt: new Date(Date.now() - 172800000), author: { name: "Team" }, sharedWith: 5 },
    ],
  },
];

const DEMO_VERSIONS: Version[] = [
  { id: "v3", timestamp: new Date(Date.now() - 3600000), author: { name: "Alice" }, message: "Updated system prompt for better context", changes: 12 },
  { id: "v2", timestamp: new Date(Date.now() - 7200000), author: { name: "Bob" }, message: "Added temperature parameter", changes: 5 },
  { id: "v1", timestamp: new Date(Date.now() - 86400000), author: { name: "Alice" }, message: "Initial version", changes: 48 },
];

const DEMO_COMMENTS: Comment[] = [
  { id: "c1", author: { name: "Bob" }, content: "Consider lowering temperature for more deterministic responses", timestamp: new Date(Date.now() - 1800000), line: 5, resolved: false },
  { id: "c2", author: { name: "Charlie" }, content: "This prompt works well for code reviews!", timestamp: new Date(Date.now() - 7200000), line: 12, resolved: false, replies: [{ id: "c2-r1", author: { name: "Alice" }, content: "Thanks!", timestamp: new Date(Date.now() - 3600000) }] },
];

const DEMO_TEST_RESULTS: TestResult[] = [
  { id: "t1", name: "Basic Prompt Test", status: "passed", duration: 234, output: "Prompt executed successfully with 3 variables resolved" },
  { id: "t2", name: "Context Window Test", status: "failed", duration: 156, error: "Input exceeds model context window (8192 tokens)" },
  { id: "t3", name: "Temperature Test", status: "pending" },
];

const TEST_CONFIGS = [
  { provider: "openai" as const, model: "gpt-4" },
  { provider: "anthropic" as const, model: "claude-3-opus" },
];

export default function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const workspaceId = id as Id<"workspaces">;

  const workspace = useQuery(api.workspaces.getWorkspace, { workspaceId });
  const allWorkspaces = useQuery(api.workspaces.listWorkspaces, {});
  const prompts = useQuery(api.prompts.listPrompts, { workspaceId });

  const [selectedPromptId, setSelectedPromptId] = useState<Id<"prompts"> | null>(null);

  useEffect(() => {
    if (prompts?.length && !selectedPromptId) setSelectedPromptId(prompts[0]._id);
  }, [prompts, selectedPromptId]);

  const promptDetail = useQuery(api.prompts.getPrompt, selectedPromptId ? { promptId: selectedPromptId } : "skip");
  const versions = useQuery(api.prompts.getPromptVersions, selectedPromptId ? { promptId: selectedPromptId } : "skip");
  const comments = useQuery(api.comments.getComments, selectedPromptId ? { promptId: selectedPromptId } : "skip");
  const votes = useQuery(api.voting.getVotes, selectedPromptId ? { promptId: selectedPromptId } : "skip");
  const userVoteData = useQuery(api.voting.getUserVote, selectedPromptId ? { promptId: selectedPromptId } : "skip");
  const testRuns = useQuery(api.testRuns.listTestRuns, selectedPromptId ? { promptId: selectedPromptId } : "skip");

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
  const voteMutation = useMutation(api.voting.votePrompt);
  const addCommentMutation = useMutation(api.comments.addComment);
  const resolveCommentMutation = useMutation(api.comments.resolveComment);
  const replyCommentMutation = useMutation(api.comments.replyComment);
  const restoreVersionMutation = useMutation(api.prompts.restoreVersion);
  const runTestMutation = useMutation(api.testRuns.runTest);

  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [activeTab, setActiveTab] = useState("versions");
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [testValues, setTestValues] = useState<Record<string, string>>({});

  useEffect(() => { if (promptDetail) { setContent(promptDetail.content); setSaved(true); } }, [promptDetail]);
  useEffect(() => { if (votes) { setUpvotes(votes.filter(v => v.value === 1).length); setDownvotes(votes.filter(v => v.value === -1).length); } }, [votes]);
  useEffect(() => { setUserVote(userVoteData ? (userVoteData.value === 1 ? "up" : "down") : null); }, [userVoteData]);
  useEffect(() => {
    if (testRuns?.length) {
      const latest = testRuns[0];
      setTestResults((latest.results || []).map((r: any, idx: number) => ({
        id: `${latest._id}-${idx}`, name: `${r.provider}/${r.model}`, status: r.error ? "failed" : "passed",
        duration: r.latency, error: r.error, output: r.response,
      })));
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
  const handleTest = async () => { if (!selectedPromptId) return; setTesting(true); try { await runTestMutation({ promptId: selectedPromptId, configs: TEST_CONFIGS }); } catch (e) { console.error(e); } finally { setTesting(false); } };
  const handleExport = () => { if (!content) return; const blob = new Blob([content], { type: "text/plain" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "prompt.txt"; a.click(); URL.revokeObjectURL(url); };
  const handleUpvote = () => { if (!selectedPromptId) return; voteMutation({ promptId: selectedPromptId, value: 1 }); };
  const handleDownvote = () => { if (!selectedPromptId) return; voteMutation({ promptId: selectedPromptId, value: -1 }); };
  const handleAddComment = (contentStr: string, line?: number) => { if (!selectedPromptId) return; addCommentMutation({ promptId: selectedPromptId, content: contentStr, selectionStart: line, selectionEnd: line }); };
  const handleResolveComment = (commentId: string) => { resolveCommentMutation({ commentId: commentId as Id<"comments"> }); };
  const handleReplyComment = (commentId: string, contentStr: string) => { replyCommentMutation({ parentId: commentId as Id<"comments">, content: contentStr }); };
  const handleRestoreVersion = (versionId: string) => { if (!selectedPromptId) return; restoreVersionMutation({ promptId: selectedPromptId, versionId: versionId as Id<"promptVersions"> }); };
  const handleCreatePrompt = async (wsId: string) => { const result = await createPrompt({ workspaceId: wsId as Id<"workspaces">, title: "New Prompt", content: "" }); if (result?.promptId) setSelectedPromptId(result.promptId); };
  const handleRenamePrompt = async (promptId: string, newName: string) => { await updatePromptTitle({ promptId: promptId as Id<"prompts">, title: newName }); };
  const handleRenameWorkspace = async (wsId: string, newName: string) => { await updateWorkspaceName({ workspaceId: wsId as Id<"workspaces">, name: newName }); };

  const sidebarWorkspaces: WorkspaceItem[] = (allWorkspaces ?? []).map((ws) => ({
    id: ws._id, name: ws.name,
    prompts: ws._id === workspaceId ? (prompts ?? []).map((p) => ({ id: p._id, name: p.title, updatedAt: new Date(p.createdAt) })) : [],
  }));

  const isMainLoading = Boolean(selectedPromptId && !promptDetail);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        {/* Sidebar */}
        <ResizablePanel defaultSize={16} minSize={10} maxSize={30}>
          <BoneSkeleton
            name="sidebar"
            loading={allWorkspaces === undefined}
            fixture={<WorkspaceSidebar workspaces={DEMO_WORKSPACES} activeWorkspaceId="demo-workspace" activePromptId="prompt-1" onSelectPrompt={() => {}} onCreatePrompt={() => {}} />}
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
              onSelectPrompt={(_, promptId) => setSelectedPromptId(promptId as Id<"prompts">)}
              onCreatePrompt={handleCreatePrompt}
              onRenamePrompt={handleRenamePrompt}
              onRenameWorkspace={handleRenameWorkspace}
            />
          </BoneSkeleton>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Parameters */}
        <ResizablePanel defaultSize={18} minSize={12} maxSize={35}>
          <ParametersPanel
            content={content}
            testValues={testValues}
            onTestValuesChange={setTestValues}
            onRunTest={handleTest}
            apiKeys={apiKeys}
            selectedKeyId={selectedKeyId}
            onKeyChange={setSelectedKeyId}
            models={models ?? []}
            onTemperatureChange={setTemperature}
            onMaxTokensChange={setMaxTokens}
            temperature={temperature}
            maxTokens={maxTokens}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Editor area */}
        <ResizablePanel defaultSize={41} minSize={15} maxSize={75}>
          <div className="flex flex-col h-full min-w-0 overflow-hidden">
            <Toolbar onSave={handleSave} onBranch={() => {}} onTest={handleTest} onExport={handleExport} onShare={() => {}} saved={saved} testing={testing} branchName="main" />

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
                <TestResultsPanel results={testResults} onRunTest={handleTest} isRunning={testing} />
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
                <TabsTrigger value="comments" className="flex-1 gap-1"><MessageSquareIcon className="size-3" />Comments</TabsTrigger>
                <TabsTrigger value="voting" className="flex-1 gap-1"><SparklesIcon className="size-3" />Vote</TabsTrigger>
              </TabsList>

              <TabsContent value="versions" className="flex-1 m-0 p-0">
                <VersionHistoryPanel
                  versions={(versions ?? []).map((v) => ({ id: v._id, timestamp: new Date(v.createdAt), author: { name: v.authorName || "Unknown" }, message: v.version === 1 ? "Initial version" : `Version ${v.version}`, changes: v.changes ?? 0 }))}
                  currentVersionId={promptDetail?.currentVersion?.toString()}
                  onRestore={handleRestoreVersion}
                />
              </TabsContent>

              <TabsContent value="comments" className="flex-1 m-0 p-0">
                <CommentsPanel
                  comments={(comments ?? []).map((c) => ({ id: c._id, author: { name: c.authorName || "Unknown" }, content: c.content, timestamp: new Date(c.createdAt), line: c.selectionStart, resolved: c.resolved }))}
                  onAddComment={handleAddComment}
                  onResolve={handleResolveComment}
                  onReply={handleReplyComment}
                />
              </TabsContent>

              <TabsContent value="voting" className="flex-1 m-0 p-0">
                <VotingControls upvotes={upvotes} downvotes={downvotes} userVote={userVote} onUpvote={handleUpvote} onDownvote={handleDownvote} />
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
