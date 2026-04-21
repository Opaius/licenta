"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Skeleton as BoneSkeleton } from "boneyard-js/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  UsersIcon,
  MessageSquareIcon,
  GitBranchIcon,
  SparklesIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { WorkspaceSidebar, type WorkspaceItem } from "@/components/editor/workspace-sidebar";
import { PromptEditor } from "@/components/editor/prompt-editor";
import { VersionHistoryPanel, type Version } from "@/components/editor/version-history-panel";
import { CommentsPanel, type Comment } from "@/components/editor/comments-panel";
import { VotingControls } from "@/components/editor/voting-controls";
import { Toolbar } from "@/components/editor/editor-toolbar";
import { TestResultsPanel, type TestResult } from "@/components/editor/test-results-panel";

// Default prompt for fixture
const DEFAULT_PROMPT = `You are an expert code reviewer. Your role is to analyze code changes and provide constructive feedback.

## Context
{{context}}

## Task
Review the following code changes and provide feedback on:
- Potential bugs or edge cases
- Code quality and readability
- Security concerns
- Performance implications
- Test coverage

## Guidelines
- Be specific and actionable
- Provide code examples when possible
- Focus on the most important issues first
- Be respectful and constructive

## Output Format
Provide your review in markdown format with clear sections.

## Parameters
temperature: {{temperature|0.7}}
top_p: {{top_p|0.9}}
max_tokens: {{max_tokens|2000}}
`;

// Fixture data — used only during boneyard capture, never in production
const DEMO_WORKSPACES: WorkspaceItem[] = [
  {
    id: "demo-workspace",
    name: "My Prompts",
    prompts: [
      {
        id: "prompt-1",
        name: "Customer Support Agent",
        updatedAt: new Date(Date.now() - 3600000),
        author: { name: "Alice" },
        sharedWith: 2,
      },
      {
        id: "prompt-2",
        name: "Code Reviewer",
        updatedAt: new Date(Date.now() - 7200000),
        author: { name: "Bob" },
      },
      {
        id: "prompt-3",
        name: "Summarizer",
        updatedAt: new Date(Date.now() - 86400000),
        author: { name: "Alice" },
        sharedWith: 1,
      },
    ],
  },
  {
    id: "shared-workspace",
    name: "Team Prompts",
    prompts: [
      {
        id: "prompt-4",
        name: "Q&A Generator",
        updatedAt: new Date(Date.now() - 172800000),
        author: { name: "Team" },
        sharedWith: 5,
      },
    ],
  },
];

const DEMO_VERSIONS: Version[] = [
  {
    id: "v3",
    timestamp: new Date(Date.now() - 3600000),
    author: { name: "Alice" },
    message: "Updated system prompt for better context",
    changes: 12,
  },
  {
    id: "v2",
    timestamp: new Date(Date.now() - 7200000),
    author: { name: "Bob" },
    message: "Added temperature parameter",
    changes: 5,
  },
  {
    id: "v1",
    timestamp: new Date(Date.now() - 86400000),
    author: { name: "Alice" },
    message: "Initial version",
    changes: 48,
  },
];

const DEMO_COMMENTS: Comment[] = [
  {
    id: "c1",
    author: { name: "Bob" },
    content: "Consider lowering temperature for more deterministic responses",
    timestamp: new Date(Date.now() - 1800000),
    line: 5,
    resolved: false,
  },
  {
    id: "c2",
    author: { name: "Charlie" },
    content: "This prompt works well for code reviews!",
    timestamp: new Date(Date.now() - 7200000),
    line: 12,
    resolved: false,
    replies: [
      {
        id: "c2-r1",
        author: { name: "Alice" },
        content: "Thanks! Let me know if you have any suggestions for improvement",
        timestamp: new Date(Date.now() - 3600000),
      },
    ],
  },
];

const DEMO_TEST_RESULTS: TestResult[] = [
  {
    id: "t1",
    name: "Basic Prompt Test",
    status: "passed",
    duration: 234,
    output: "Prompt executed successfully with 3 variables resolved",
  },
  {
    id: "t2",
    name: "Context Window Test",
    status: "failed",
    duration: 156,
    error: "Input exceeds model context window (8192 tokens)",
  },
  {
    id: "t3",
    name: "Temperature Test",
    status: "pending",
  },
];

// Fixture component for boneyard capture (shows static layout)
function WorkspaceFixture() {
  return (
    <>
      {/* Editor area */}
      <div className="flex-1 relative">
        <div className="h-full w-full bg-muted flex items-center justify-center">
          <span className="text-muted-foreground">Prompt Editor (Demo)</span>
        </div>
      </div>

      {/* Test results */}
      <TestResultsPanel results={DEMO_TEST_RESULTS} onRunTest={() => {}} isRunning={false} />

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t text-xs text-muted-foreground bg-muted/30">
        <div className="flex items-center gap-3">
          <span>Ln 1, Col 1</span>
          <span>Prompt Template</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-xs">2 online</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-1">
            <UsersIcon className="size-3" />
            <span>2 online</span>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="h-full border-l flex flex-col">
        <Tabs value="versions" onValueChange={() => {}}>
          <TabsList className="w-full rounded-none border-b">
            <TabsTrigger value="versions" className="flex-1 gap-1">
              <GitBranchIcon className="size-3" />
              Versions
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex-1 gap-1">
              <MessageSquareIcon className="size-3" />
              Comments
            </TabsTrigger>
            <TabsTrigger value="voting" className="flex-1 gap-1">
              <SparklesIcon className="size-3" />
              Vote
            </TabsTrigger>
          </TabsList>

          <TabsContent value="versions" className="flex-1 m-0 p-0">
            <VersionHistoryPanel
              versions={DEMO_VERSIONS}
              currentVersionId="v3"
              onRestore={() => {}}
            />
          </TabsContent>

          <TabsContent value="comments" className="flex-1 m-0 p-0">
            <CommentsPanel
              comments={DEMO_COMMENTS}
              onAddComment={() => {}}
              onResolve={() => {}}
              onReply={() => {}}
            />
          </TabsContent>

          <TabsContent value="voting" className="flex-1 m-0 p-0">
            <VotingControls
              upvotes={24}
              downvotes={3}
              userVote="up"
              onUpvote={() => {}}
              onDownvote={() => {}}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

// Test configs
const TEST_CONFIGS = [
  { provider: "openai" as const, model: "gpt-4" },
  { provider: "anthropic" as const, model: "claude-3-opus" },
];

export default function WorkspacePage({
  params,
}: {
  params: { id: string };
}) {
  const workspaceId = params.id;

  // Queries
  const workspace = useQuery(api.workspaces.getWorkspace, { workspaceId });
  const allWorkspaces = useQuery(api.workspaces.listWorkspaces, {});
  const prompts = useQuery(api.prompts.listPrompts, { workspaceId });

  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);

  // Select first prompt when loaded
  useEffect(() => {
    if (prompts?.length && !selectedPromptId) {
      setSelectedPromptId(prompts[0]._id);
    }
  }, [prompts, selectedPromptId]);

  // Prompt detail and related
  const promptDetail = useQuery(
    api.prompts.getPrompt,
    { promptId: selectedPromptId! },
    { enabled: !!selectedPromptId }
  );
  const versions = useQuery(
    api.prompts.getPromptVersions,
    { promptId: selectedPromptId! },
    { enabled: !!selectedPromptId }
  );
  const comments = useQuery(
    api.comments.getComments,
    { promptId: selectedPromptId! },
    { enabled: !!selectedPromptId }
  );
  const votes = useQuery(
    api.voting.getVotes,
    { promptId: selectedPromptId! },
    { enabled: !!selectedPromptId }
  );
  const userVoteData = useQuery(
    api.voting.getUserVote,
    { promptId: selectedPromptId! },
    { enabled: !!selectedPromptId }
  );
  const testRuns = useQuery(
    api.testRuns.listTestRuns,
    { promptId: selectedPromptId! },
    { enabled: !!selectedPromptId }
  );

  // Mutations
  const updatePrompt = useMutation(api.prompts.updatePrompt);
  const createPrompt = useMutation(api.prompts.createPrompt);
  const voteMutation = useMutation(api.voting.votePrompt);
  const addCommentMutation = useMutation(api.comments.addComment);
  const resolveCommentMutation = useMutation(api.comments.resolveComment);
  const replyCommentMutation = useMutation(api.comments.replyComment);
  const restoreVersionMutation = useMutation(api.prompts.restoreVersion);
  const runTestMutation = useMutation(api.testRuns.runTest);

  // Local UI state
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("versions");
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);

  // Sync prompt content when selection changes
  useEffect(() => {
    if (promptDetail) {
      setContent(promptDetail.content);
      setSaved(true);
    }
  }, [promptDetail]);

  // Update vote counts
  useEffect(() => {
    if (votes) {
      const up = votes.filter((v) => v.value === 1).length;
      const down = votes.filter((v) => v.value === -1).length;
      setUpvotes(up);
      setDownvotes(down);
    }
  }, [votes]);

  // Update current user vote
  useEffect(() => {
    if (userVoteData) {
      setUserVote(userVoteData.value === 1 ? "up" : "down");
    } else {
      setUserVote(null);
    }
  }, [userVoteData]);

  // Update test results from latest run
  useEffect(() => {
    if (testRuns?.length) {
      const latestRun = testRuns[0];
      const mapped: TestResult[] = latestRun.results.map((r, idx) => ({
        id: `${latestRun._id}-${idx}`,
        name: `${r.provider}/${r.model}`,
        status: r.error ? "failed" : "passed",
        duration: r.latency,
        error: r.error,
        output: r.response,
      }));
      setTestResults(mapped);
    }
  }, [testRuns]);

  // Handlers
  const handleSave = async () => {
    if (!selectedPromptId) return;
    await updatePrompt({ promptId: selectedPromptId, content });
    setSaved(true);
  };

  const handleBranch = () => console.log("Create branch");

  const handleTest = async () => {
    if (!selectedPromptId) return;
    setTesting(true);
    try {
      await runTestMutation({
        promptId: selectedPromptId,
        configs: TEST_CONFIGS,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setTesting(false);
    }
  };

  const handleExport = () => {
    if (!content) return;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prompt.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => console.log("Share");

  const handleUpvote = () => {
    if (!selectedPromptId) return;
    const newValue = userVote === "up" ? null : 1;
    voteMutation({ promptId: selectedPromptId, value: newValue as 1 | -1 | null });
  };

  const handleDownvote = () => {
    if (!selectedPromptId) return;
    const newValue = userVote === "down" ? null : -1;
    voteMutation({ promptId: selectedPromptId, value: newValue as 1 | -1 | null });
  };

  const handleAddComment = (contentStr: string, line?: number) => {
    if (!selectedPromptId) return;
    addCommentMutation({
      promptId: selectedPromptId,
      content: contentStr,
      selectionStart: line,
      selectionEnd: line,
    });
  };

  const handleResolveComment = (commentId: string) => {
    resolveCommentMutation({ commentId });
  };

  const handleReplyComment = (commentId: string, contentStr: string) => {
    replyCommentMutation({ parentId: commentId, content: contentStr });
  };

  const handleRestoreVersion = (versionId: string) => {
    if (!selectedPromptId) return;
    restoreVersionMutation({ promptId: selectedPromptId, versionId });
  };

  const handleCreatePrompt = async (wsId: string) => {
    const result = await createPrompt({
      workspaceId: wsId,
      title: "New Prompt",
      content: "",
    });
    if (result?.promptId) {
      setSelectedPromptId(result.promptId);
    }
  };

  // Build sidebar workspaces array
  const sidebarWorkspaces: WorkspaceItem[] = (allWorkspaces ?? []).map((ws) => ({
    id: ws._id,
    name: ws.name,
    prompts:
      ws._id === workspaceId
        ? (prompts ?? []).map((p) => ({
            id: p._id,
            name: p.title,
            updatedAt: new Date(p.createdAt),
          }))
        : [],
  }));

  // Main content loading flag
  const isMainLoading = selectedPromptId && !promptDetail;

  // Simple fallback for skeleton before bones generated
  const SidebarFallback = () => (
    <div className="p-2 space-y-2">
      <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
      <div className="h-8 w-1/2 bg-muted rounded animate-pulse" />
      <div className="h-8 w-2/3 bg-muted rounded animate-pulse" />
    </div>
  );

  const MainFallback = () => (
    <div className="flex items-center justify-center h-full">
      <span className="text-muted-foreground">Loading…</span>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 border-r">
        <BoneSkeleton
          name="sidebar"
          loading={allWorkspaces === undefined}
          fixture={<WorkspaceSidebar workspaces={DEMO_WORKSPACES} activeWorkspaceId="demo-workspace" activePromptId="prompt-1" onSelectPrompt={() => {}} onCreatePrompt={() => {}} />}
          fallback={<SidebarFallback />}
        >
          <WorkspaceSidebar
            workspaces={sidebarWorkspaces}
            activeWorkspaceId={workspaceId}
            activePromptId={selectedPromptId ?? undefined}
            onSelectPrompt={(_, promptId) => setSelectedPromptId(promptId)}
            onCreatePrompt={handleCreatePrompt}
          />
        </BoneSkeleton>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Toolbar
          onSave={handleSave}
          onBranch={handleBranch}
          onTest={handleTest}
          onExport={handleExport}
          onShare={handleShare}
          saved={saved}
          testing={testing}
          branchName={"main"}
        />

        <BoneSkeleton
          name="main-content"
          loading={isMainLoading}
          fixture={<WorkspaceFixture />}
          fallback={<MainFallback />}
        >
          {selectedPromptId && promptDetail ? (
            <ResizablePanelGroup direction="horizontal" className="flex flex-1 min-w-0 overflow-hidden">
              {/* Editor + Test Results */}
              <ResizablePanel defaultSize={80} minSize={50}>
                <div className="flex flex-col h-full min-w-0">
                  <div className="flex-1 relative">
                    <PromptEditor
                      value={content}
                      onChange={(v) => {
                        setContent(v);
                        setSaved(false);
                      }}
                      onCursorChange={(line, column) =>
                        setCursorPosition({ line, column })
                      }
                    />
                  </div>

                  <TestResultsPanel
                    results={testResults}
                    onRunTest={handleTest}
                    isRunning={testing}
                  />
                  <div className="flex items-center justify-between px-3 py-1.5 border-t text-xs text-muted-foreground bg-muted/30">
                    <div className="flex items-center gap-3">
                      <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
                      <span>Prompt Template</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-xs">1 online</span>
                      </div>
                      <Separator orientation="vertical" className="h-4" />
                      <div className="flex items-center gap-1">
                        <UsersIcon className="size-3" />
                        <span>1 online</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle
                withHandle
                className="hover:bg-primary/20 transition-colors cursor-pointer"
                onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
              />

              {/* Right panel: Versions / Comments / Voting */}
              <ResizablePanel
                minSize={20}
                maxSize={50}
                defaultSize={rightPanelCollapsed ? 0 : 20}
                style={{ display: rightPanelCollapsed ? "none" : "flex" }}
              >
                <div className="h-full border-l flex flex-col">
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
                    <TabsList className="w-full rounded-none border-b">
                      <TabsTrigger value="versions" className="flex-1 gap-1">
                        <GitBranchIcon className="size-3" />
                        Versions
                      </TabsTrigger>
                      <TabsTrigger value="comments" className="flex-1 gap-1">
                        <MessageSquareIcon className="size-3" />
                        Comments
                      </TabsTrigger>
                      <TabsTrigger value="voting" className="flex-1 gap-1">
                        <SparklesIcon className="size-3" />
                        Vote
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="versions" className="flex-1 m-0 p-0">
                      <VersionHistoryPanel
                        versions={(versions ?? []).map((v) => ({
                          id: v._id,
                          timestamp: new Date(v.createdAt),
                          author: { name: v.authorId },
                          message: `Version ${v.version}`,
                          changes: 0,
                        }))}
                        currentVersionId={promptDetail?.currentVersion?.toString()}
                        onRestore={handleRestoreVersion}
                      />
                    </TabsContent>

                    <TabsContent value="comments" className="flex-1 m-0 p-0">
                      <CommentsPanel
                        comments={(comments ?? []).map((c) => ({
                          id: c._id,
                          author: { name: c.authorId },
                          content: c.content,
                          timestamp: new Date(c.createdAt),
                          line: c.selectionStart,
                          resolved: c.resolved,
                        }))}
                        onAddComment={handleAddComment}
                        onResolve={handleResolveComment}
                        onReply={handleReplyComment}
                      />
                    </TabsContent>

                    <TabsContent value="voting" className="flex-1 m-0 p-0">
                      <VotingControls
                        upvotes={upvotes}
                        downvotes={downvotes}
                        userVote={userVote}
                        onUpvote={handleUpvote}
                        onDownvote={handleDownvote}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
              <p>Select a prompt or create a new one</p>
              <Button
                onClick={() => {
                  if (workspaceId) handleCreatePrompt(workspaceId);
                }}
              >
                Create Prompt
              </Button>
            </div>
          )}
        </BoneSkeleton>
      </div>
    </div>
  );
}
