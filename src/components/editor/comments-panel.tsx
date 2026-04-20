"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageSquareIcon, ReplyIcon, PlusIcon } from "lucide-react";

export interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: Date;
  line?: number;
  replies?: Comment[];
  resolved?: boolean;
}

interface CommentsPanelProps {
  comments: Comment[];
  onAddComment?: (content: string, line?: number) => void;
  onResolve?: (commentId: string) => void;
  onReply?: (commentId: string, content: string) => void;
}

export function CommentsPanel({
  comments,
  onAddComment,
  onResolve,
  onReply,
}: CommentsPanelProps) {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return date.toLocaleDateString();
  };

  const handleSubmitComment = () => {
    if (newComment.trim() && onAddComment) {
      onAddComment(newComment.trim());
      setNewComment("");
    }
  };

  const handleSubmitReply = (parentId: string) => {
    if (replyContent.trim() && onReply) {
      onReply(parentId, replyContent.trim());
      setReplyContent("");
      setReplyingTo(null);
    }
  };

  return (
    <Card className="h-full border-0 shadow-none">
      <CardHeader className="py-3 px-4 border-b">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <MessageSquareIcon className="size-4" />
          Comments
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex flex-col h-[calc(100%-44px)]">
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No comments yet
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id}>
                  <div
                    className={`p-2 rounded-lg ${
                      comment.resolved ? "bg-muted/50 opacity-60" : "bg-muted"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <Avatar className="size-6 mt-0.5">
                        <AvatarImage src={comment.author.avatar} />
                        <AvatarFallback className="text-[10px]">
                          {comment.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {comment.author.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.timestamp)}
                          </span>
                          {comment.line && (
                            <span className="text-xs text-primary">
                              Line {comment.line}
                            </span>
                          )}
                        </div>
                        <p className="text-sm mt-1">{comment.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() =>
                              setReplyingTo(replyingTo === comment.id ? null : comment.id)
                            }
                          >
                            <ReplyIcon className="size-3 mr-1" />
                            Reply
                          </Button>
                          {!comment.resolved && (
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => onResolve?.(comment.id)}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    {replyingTo === comment.id && (
                      <div className="mt-2 pl-8">
                        <textarea
                          className="w-full min-h-[60px] text-sm p-2 rounded border border-input resize-none"
                          placeholder="Write a reply..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                        />
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            onClick={() => handleSubmitReply(comment.id)}
                          >
                            Reply
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyContent("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-6 mt-2 space-y-2 border-l-2 border-border pl-3">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="p-2 rounded bg-muted/50">
                          <div className="flex items-start gap-2">
                            <Avatar className="size-5">
                              <AvatarImage src={reply.author.avatar} />
                              <AvatarFallback className="text-[8px]">
                                {reply.author.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium">
                                  {reply.author.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(reply.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm">{reply.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <div className="p-2 border-t">
          <textarea
            className="w-full min-h-[80px] text-sm p-2 rounded-lg border border-input resize-none"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleSubmitComment();
              }
            }}
          />
          <Button
            size="sm"
            className="w-full mt-2"
            onClick={handleSubmitComment}
            disabled={!newComment.trim()}
          >
            <PlusIcon className="size-4 mr-1" />
            Add Comment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
