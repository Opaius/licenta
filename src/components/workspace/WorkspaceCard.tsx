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
    <Link href={`/workspace/${id}`}>
      <Card className="group transition-all hover:border-primary/50 hover:shadow-md">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            {isPublic ? (
              <Unlock className="size-4 text-muted-foreground" />
            ) : (
              <Lock className="size-4 text-muted-foreground" />
            )}
            <CardTitle className="text-lg font-semibold">{name}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 opacity-0 group-hover:opacity-100"
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
        <CardContent>
          <CardDescription className="line-clamp-2 min-h-[2.5rem]">
            {description || "No description provided"}
          </CardDescription>
        </CardContent>
        <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Users className="size-3.5" />
              {memberCount}
            </span>
            <span className="flex items-center gap-1">
              <Layers className="size-3.5" />
              {promptsCount}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {isPublic ? "Public" : "Private"}
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}