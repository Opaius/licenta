"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

import { PromptEditor } from "@/components/editor/prompt-editor";
import { VersionHistoryPanel, type Version } from "@/components/editor/version-history-panel";
import { CommentsPanel, type Comment } from "@/components/editor/comments-panel";
import { VotingControls } from "@/components/editor/voting-controls";
import { Toolbar } from "@/components/editor/editor-toolbar";
import { TestResultsPanel, type TestResult } from "@/components/editor/test-results-panel";
import { WorkspaceSidebar, type WorkspaceItem } from "@/components/editor/workspace-sidebar";
import {
  UsersIcon,
  MessageSquareIcon,
  GitBranchIcon,
  SparklesIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserPresence {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  cursor?: { line: number; column: number };
}

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

const DEMO_PRESENCE: UserPresence[] = [
  { id: "u1", name: "Alice", color: "#3b82f6", cursor: { line: 12, column: 5 } },
  { id: "u2", name: "Bob", color: "#22c55e", cursor: { line: 8, column: 20 } },
];

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

export default function WorkspacePage() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [saved, setSaved] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [activeTab, setActiveTab] = useState("versions");
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [upvotes, setUpvotes] = useState(24);
  const [downvotes, setDownvotes] = useState(3);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [branchName] = useState("main");

  const handleSave = () => {
    setSaved(true);
  };

  const handleBranch = () => {
    console.log("Create branch");
  };

  const handleTest = () => {
    setTesting(true);
    setTestResults((prev) =>
      prev.map((r) =>
        r.status === "pending" ? { ...r, status: "running" as const } : r
      )
    );
    setTimeout(() => {
      setTestResults(DEMO_TEST_RESULTS);
      setTesting(false);
    }, 1000);
  };

  const handleExport = () => {
    const blob = new Blob([prompt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prompt.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    console.log("Share");
  };

  const handleUpvote = () => {
    if (userVote === "up") {
      setUpvotes((v) => v - 1);
      setUserVote(null);
    } else if (userVote === "down") {
      setDownvotes((v) => v - 1);
      setUpvotes((v) => v + 1);
      setUserVote("up");
    } else {
      setUpvotes((v) => v + 1);
      setUserVote("up");
    }
  };

  const handleDownvote = () => {
    if (userVote === "down") {
      setDownvotes((v) => v - 1);
      setUserVote(null);
    } else if (userVote === "up") {
      setUpvotes((v) => v - 1);
      setDownvotes((v) => v + 1);
      setUserVote("down");
    } else {
      setDownvotes((v) => v + 1);
      setUserVote("down");
    }
  };

  const handleAddComment = (content: string) => {
    console.log("Add comment:", content);
  };

  const handleResolveComment = (commentId: string) => {
    console.log("Resolve comment:", commentId);
  };

  const handleReplyComment = (commentId: string, content: string) => {
    console.log("Reply to comment:", commentId, content);
  };

  const handleRestoreVersion = (versionId: string) => {
    console.log("Restore version:", versionId);
  };

  return (
    <div className="flex h-screen w-full bg-background">
        <div className="w-64 flex-shrink-0 border-r">
          <WorkspaceSidebar
            workspaces={DEMO_WORKSPACES}
            activeWorkspaceId="demo-workspace"
            activePromptId="prompt-1"
            onSelectPrompt={(wsId, promptId) =>
              console.log("Select:", wsId, promptId)
            }
          />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <Toolbar
            onSave={handleSave}
            onBranch={handleBranch}
            onTest={handleTest}
            onExport={handleExport}
            onShare={handleShare}
            saved={saved}
            testing={testing}
            branchName={branchName}
          />

          <ResizablePanelGroup direction="horizontal" className="flex flex-1 min-w-0 overflow-hidden">
            <ResizablePanel defaultSize={80} minSize={50}>
              <div className="flex flex-col h-full min-w-0">
                <div className="flex-1 relative">
                  <PromptEditor
                    value={prompt}
                    onChange={(v) => {
                      setPrompt(v);
                      setSaved(false);
                    }}
                    onCursorChange={(line, column) =>
                      setCursorPosition({ line, column })
                    }
                  />
                </div>

                <TestResultsPanel
                  results={testResults.length > 0 ? testResults : DEMO_TEST_RESULTS}
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
                      {DEMO_PRESENCE.map((user) => (
                        <div
                          key={user.id}
                          className="relative"
                          style={{ zIndex: DEMO_PRESENCE.indexOf(user) }}
                        >
                          <Avatar
                            className="size-6 border-2"
                            style={{ borderColor: user.color }}
                          >
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-[10px]">
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      ))}
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-1">
                      <UsersIcon className="size-3" />
                      <span>{DEMO_PRESENCE.length} online</span>
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
                      versions={DEMO_VERSIONS}
                      currentVersionId="v3"
                      onRestore={handleRestoreVersion}
                    />
                  </TabsContent>

                  <TabsContent value="comments" className="flex-1 m-0 p-0">
                    <CommentsPanel
                      comments={DEMO_COMMENTS}
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
        </div>
    </div>
  );
}