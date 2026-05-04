"use client";

import { use } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ChevronUp,
  ChevronDown,
  FlaskConical,
  MessageSquareIcon,
  GitBranchIcon,
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function VersionPage({
  params,
}: {
  params: Promise<{ id: string; promptId: string; versionId: string }>;
}) {
  const { id, promptId, versionId } = use(params);
  const workspaceId = id as Id<"workspaces">;
  const router = useRouter();

  const version = useQuery(api.prompts.getVersion, {
    versionId: versionId as Id<"promptVersions">,
  });
  const testRuns = useQuery(api.testRuns.listVersionTestRuns, {
    versionId: versionId as Id<"promptVersions">,
  });
  const comments = useQuery(api.comments.getComments, {
    promptId: promptId as Id<"prompts">,
    versionId: versionId as Id<"promptVersions">,
  });

  const voteMutation = useMutation(api.voting.voteVersion);
  const addCommentMutation = useMutation(api.comments.addComment);

  const handleVote = async (value: 1 | -1) => {
    try {
      await voteMutation({
        versionId: versionId as Id<"promptVersions">,
        value,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Vote failed");
    }
  };

  const handleAddComment = async (content: string) => {
    if (!content.trim()) return;
    await addCommentMutation({
      promptId: promptId as Id<"prompts">,
      content,
      versionId: versionId as Id<"promptVersions">,
    });
  };

  if (!version) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <span className="text-muted-foreground">Loading version…</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
        {/* Header */}
        <header className="flex h-12 items-center justify-between border-b border-border bg-background px-4 shrink-0">
          <div className="flex items-center gap-2 text-sm min-w-0">
            <button
              onClick={() => router.push(`/workspace/${workspaceId}`)}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <ArrowLeftIcon className="size-3.5" />
              <span>Back to editor</span>
            </button>
            <Separator orientation="vertical" className="h-4" />
            <span className="font-medium truncate">{version.promptTitle}</span>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-muted-foreground">Version {version.version}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {version.hasTestRuns ? (
              <Badge variant="outline" className="text-green-500 border-green-500/30 gap-1">
                <FlaskConical className="size-3" />
                Tested
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-500 border-amber-500/30 gap-1">
                <FlaskConical className="size-3" />
                Untested
              </Badge>
            )}
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger>
                  <span
                    className={cn(
                      "p-1 rounded hover:bg-muted transition-colors inline-flex",
                      version.userVote === 1 ? "text-green-600" : "text-muted-foreground",
                      !version.hasTestRuns && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => version.hasTestRuns && handleVote(1)}
                  >
                    <ChevronUp className="size-5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{version.hasTestRuns ? "Upvote" : "Test before voting"}</p>
                </TooltipContent>
              </Tooltip>
              <span
                className={cn(
                  "text-sm font-bold min-w-[1.5rem] text-center",
                  version.voteScore > 0 && "text-green-600",
                  version.voteScore < 0 && "text-red-600",
                  version.voteScore === 0 && "text-muted-foreground"
                )}
              >
                {version.voteScore}
              </span>
              <Tooltip>
                <TooltipTrigger>
                  <span
                    className={cn(
                      "p-1 rounded hover:bg-muted transition-colors inline-flex",
                      version.userVote === -1 ? "text-red-600" : "text-muted-foreground",
                      !version.hasTestRuns && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => version.hasTestRuns && handleVote(-1)}
                  >
                    <ChevronDown className="size-5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{version.hasTestRuns ? "Downvote" : "Test before voting"}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Left: Prompt content */}
          <div className="flex-1 flex flex-col min-w-0 border-r">
            <div className="flex-1 p-4 overflow-auto">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <GitBranchIcon className="size-4" />
                    Prompt Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="p-4 rounded-lg bg-muted text-sm font-mono whitespace-pre-wrap">
                    {version.content}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right: Tests & Comments */}
          <div className="w-[420px] flex flex-col border-l">
            <Tabs defaultValue="tests" className="flex-1 flex flex-col">
              <TabsList className="w-full rounded-none border-b">
                <TabsTrigger value="tests" className="flex-1 gap-1">
                  <FlaskConical className="size-3" />
                  Tests
                </TabsTrigger>
                <TabsTrigger value="comments" className="flex-1 gap-1">
                  <MessageSquareIcon className="size-3" />
                  Comments
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tests" className="flex-1 m-0 p-0 flex flex-col">
                <ScrollArea className="flex-1">
                  <div className="p-3 space-y-2">
                    {testRuns?.length ? (
                      testRuns.map((run) =>
                        (run.results || []).map((result: any, idx: number) => (
                          <Card key={`${run._id}-${idx}`}>
                            <CardHeader className="py-2 px-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium">
                                  {result.provider}/{result.model}
                                </span>
                                <div className="flex items-center gap-2">
                                  {result.error ? (
                                    <Badge variant="destructive" className="text-[10px]">
                                      Failed
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="text-[10px]">
                                      Passed
                                    </Badge>
                                  )}
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <ClockIcon className="size-3" />
                                    {result.latency}ms
                                  </span>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="px-3 pb-3 pt-0">
                              {result.error ? (
                                <div className="p-2 rounded bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-xs font-mono">
                                  {result.error}
                                </div>
                              ) : (
                                <pre className="p-2 rounded bg-muted text-xs font-mono whitespace-pre-wrap max-h-48 overflow-auto">
                                  {result.response}
                                </pre>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      )
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                        <FlaskConical className="size-8 opacity-50" />
                        <p className="text-sm">No tests run for this version yet</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="comments" className="flex-1 m-0 p-0 flex flex-col">
                <ScrollArea className="flex-1">
                  <div className="p-3 space-y-3">
                    {comments?.length ? (
                      comments.map((comment) => (
                        <div key={comment._id} className="flex gap-2">
                          <Avatar className="size-6">
                            <AvatarFallback className="text-[10px]">
                              {comment.authorName?.charAt(0) ?? "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium">{comment.authorName}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm mt-0.5">{comment.content}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                        <MessageSquareIcon className="size-8 opacity-50" />
                        <p className="text-sm">No comments yet</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="p-3 border-t">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const input = e.currentTarget.elements.namedItem("comment") as HTMLInputElement;
                      if (input.value.trim()) {
                        handleAddComment(input.value);
                        input.value = "";
                      }
                    }}
                    className="flex gap-2"
                  >
                    <input
                      name="comment"
                      placeholder="Add a comment..."
                      className="flex-1 h-9 px-3 rounded-md border bg-background text-sm outline-none focus:ring-1 focus:ring-ring"
                    />
                    <Button type="submit" size="sm">
                      Post
                    </Button>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
