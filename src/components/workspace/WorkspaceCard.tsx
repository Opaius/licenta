"use client";

import Link from "next/link";
import { Layers, Lock, MoreHorizontal, Unlock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface WorkspaceCardProps {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  promptsCount: number;
  isPublic: boolean;
}

export function WorkspaceCard({
  id,
  name,
  description,
  memberCount,
  promptsCount,
  isPublic,
}: WorkspaceCardProps) {
  return (
    <Link href={`/workspace/${id}`} className="block">
      <Card className="group h-full overflow-hidden rounded-2xl border-border/50 bg-card transition-all duration-200 ease-out hover:scale-[1.02] hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3 pt-5 px-5">
          <div className="flex items-center gap-2.5">
            <div className={`flex size-9 items-center justify-center rounded-lg ${isPublic ? 'bg-muted/60' : 'bg-muted/60'}`}>
              {isPublic ? (
                <Unlock className="size-4 text-muted-foreground" />
              ) : (
                <Lock className="size-4 text-muted-foreground" />
              )}
            </div>
            <CardTitle className="text-base font-semibold leading-tight line-clamp-1">
              {name}
            </CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.preventDefault()}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="px-5 pb-3">
          <CardDescription className="line-clamp-2 min-h-[2.75rem] text-sm leading-relaxed">
            {description || "No description provided"}
          </CardDescription>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t border-border/40 bg-muted/20 px-5 py-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Users className="size-3.5" />
              {memberCount}
            </span>
            <span className="flex items-center gap-1.5">
              <Layers className="size-3.5" />
              {promptsCount}
            </span>
          </div>
          <Badge variant="outline" className="text-xs font-medium">
            {isPublic ? "Public" : "Private"}
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}