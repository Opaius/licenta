"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronUpIcon, ChevronDownIcon, SparklesIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface VotingControlsProps {
  upvotes: number;
  downvotes: number;
  userVote?: "up" | "down" | null;
  onUpvote?: () => void;
  onDownvote?: () => void;
}

export function VotingControls({
  upvotes,
  downvotes,
  userVote = null,
  onUpvote,
  onDownvote,
}: VotingControlsProps) {
  const score = upvotes - downvotes;
  const isUpvoted = userVote === "up";
  const isDownvoted = userVote === "down";

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="py-3 px-4 border-b">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <SparklesIcon className="size-4" />
          Quality Vote
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "size-10 rounded-full transition-colors",
              isUpvoted
                ? "text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-900"
                : "text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
            )}
            onClick={onUpvote}
          >
            <ChevronUpIcon className="size-6" />
          </Button>
          <span
            className={cn(
              "text-xl font-bold",
              score > 0 && "text-green-600",
              score < 0 && "text-red-600",
              score === 0 && "text-muted-foreground"
            )}
          >
            {score}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "size-10 rounded-full transition-colors",
              isDownvoted
                ? "text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900"
                : "text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            )}
            onClick={onDownvote}
          >
            <ChevronDownIcon className="size-6" />
          </Button>
        </div>
        <div className="mt-4 flex justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <ChevronUpIcon className="size-3" />
            <span>{upvotes} upvotes</span>
          </div>
          <div className="flex items-center gap-1">
            <ChevronDownIcon className="size-3" />
            <span>{downvotes} downvotes</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
