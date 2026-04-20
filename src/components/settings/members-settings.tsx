"use client"

import { useState } from "react"
import { MoreHorizontalIcon, TrashIcon, UserIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Member {
  id: string
  name: string
  email: string
  role: "owner" | "admin" | "member"
  avatar?: string
}

interface MembersSettingsProps {
  workspaceId: string
}

const initialMembers: Member[] = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "owner" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "admin" },
  { id: "3", name: "Bob Wilson", email: "bob@example.com", role: "member" },
]

export function MembersSettings({ workspaceId }: MembersSettingsProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers)

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()

  const getRoleBadgeVariant = (role: Member["role"]) => {
    switch (role) {
      case "owner":
        return "default"
      case "admin":
        return "secondary"
      default:
        return "outline"
    }
  }

  const changeRole = (memberId: string, newRole: Member["role"]) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    )
  }

  const removeMember = (memberId: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
        <CardDescription>Manage workspace members and their roles</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={getRoleBadgeVariant(member.role)}>
                {member.role}
              </Badge>

              {member.role !== "owner" && (
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontalIcon className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => changeRole(member.id, "admin")}
                      disabled={member.role === "admin"}
                    >
                      Make Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => changeRole(member.id, "member")}
                      disabled={member.role === "member"}
                    >
                      Make Member
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => removeMember(member.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <TrashIcon className="size-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        ))}

        {members.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            <UserIcon className="mx-auto mb-2 size-8 opacity-50" />
            <p className="text-sm">No members found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
