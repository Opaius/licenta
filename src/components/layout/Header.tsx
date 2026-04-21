"use client";

import { Bell, LogOut, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

// Type for Convex auth user (from better-auth)
interface ConvexAuthUser {
  userId: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export function Header({ user }: HeaderProps) {
  const currentUser = useQuery<ConvexAuthUser | null>(api.auth.getCurrentUser);
  const displayUser = user || currentUser || {
    name: "User",
    email: "user@example.com",
  };

  // Use email as name if name not available
  const displayName = displayUser.name || (displayUser.email ? displayUser.email.split('@')[0] : "User");

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Dashboard</span>
      </div>

      <div className="flex items-center gap-2">
<Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
  <Bell className="size-4" aria-hidden="true" />
  <span className="absolute right-1.5 top-1.5 flex size-2" aria-hidden="true">
    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
    <span className="relative inline-flex size-2 rounded-full bg-destructive" />
  </span>
</Button>

        <DropdownMenu>
          <DropdownMenuTrigger className={buttonVariants({className:"relative size-8 rounded-full", variant:"ghost"})}>

<Avatar className="size-8">
  {displayUser.avatarUrl && (
    <img src={displayUser.avatarUrl} alt={displayName} />
  )}
  <AvatarFallback>{initials}</AvatarFallback>
</Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
<DropdownMenuLabel className="font-normal">
  <div className="flex flex-col space-y-1">
    <p className="text-sm font-medium leading-none">{displayName}</p>
    <p className="text-xs leading-none text-muted-foreground">
      {displayUser.email}
    </p>
  </div>
</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}