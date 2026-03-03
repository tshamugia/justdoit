"use client";

import { useState } from "react";
import { Users, UserPlus, Check, Search, ChevronLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspaceMembers } from "@/hooks/use-workspace-members";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { MemberRole } from "@/lib/types/database.types";
import { toast } from "sonner";

function roleBadgeVariant(role: MemberRole): "default" | "secondary" | "outline" {
  if (role === "owner") return "default";
  if (role === "admin") return "secondary";
  return "outline";
}

interface AppUser {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

function useAllUsers(enabled: boolean) {
  return useQuery<AppUser[]>({
    queryKey: queryKeys.allUsers(),
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
    enabled,
  });
}

export function WorkspaceMembersDialog({
  workspaceId,
  workspaceName,
  userId,
}: {
  workspaceId: string;
  workspaceName: string;
  userId: string;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"list" | "add">("list");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);

  const queryClient = useQueryClient();
  const { data: members, isLoading } = useWorkspaceMembers(open ? workspaceId : undefined);
  const { data: allUsers = [], isLoading: usersLoading } = useAllUsers(open && view === "add");

  const currentUserRole = members?.find((m) => m.user_id === userId)?.role;
  const canAddMembers = currentUserRole === "owner" || currentUserRole === "admin";

  const memberUserIds = new Set(members?.map((m) => m.user_id) ?? []);
  const nonMembers = allUsers.filter(
    (u) => !memberUserIds.has(u.id) && u.full_name.toLowerCase().includes(search.toLowerCase())
  );

  function toggleUser(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function openAddView() {
    setView("add");
    setSearch("");
    setSelectedIds(new Set());
  }

  function closeAddView() {
    setView("list");
    setSearch("");
    setSelectedIds(new Set());
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) {
      setView("list");
      setSearch("");
      setSelectedIds(new Set());
    }
  }

  async function addMembers() {
    if (selectedIds.size === 0) return;
    setAdding(true);
    const res = await fetch(`/api/workspaces/${workspaceId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds: Array.from(selectedIds) }),
    });

    if (!res.ok) {
      const text = await res.text();
      let message = "Failed to add members";
      try {
        message = JSON.parse(text)?.error ?? message;
      } catch {
        // non-JSON error body, use default message
      }
      toast.error(message);
      setAdding(false);
      return;
    }

    queryClient.invalidateQueries({ queryKey: queryKeys.workspaceMembers(workspaceId) });
    toast.success(`${selectedIds.size} member${selectedIds.size !== 1 ? "s" : ""} added`);
    closeAddView();
    setAdding(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="mr-1 h-4 w-4" /> Members
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {view === "list" ? `${workspaceName} — Members` : "Add Members"}
            </DialogTitle>
            {view === "list" && canAddMembers && (
              <Button variant="outline" size="sm" onClick={openAddView}>
                <UserPlus className="mr-1 h-4 w-4" /> Add
              </Button>
            )}
          </div>
        </DialogHeader>

        {view === "list" && (
          <div className="divide-y">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                ))
              : members?.map((m) => {
                  const initials = m.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);
                  return (
                    <div key={m.id} className="flex items-center gap-3 py-2">
                      <Avatar className="h-8 w-8">
                        {m.avatar_url && <AvatarImage src={m.avatar_url} alt={m.full_name} />}
                        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                      </Avatar>
                      <span className="flex-1 text-sm font-medium">{m.full_name}</span>
                      <Badge variant={roleBadgeVariant(m.role)} className="capitalize text-xs">
                        {m.role}
                      </Badge>
                    </div>
                  );
                })}
          </div>
        )}

        {view === "add" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="max-h-64 overflow-y-auto rounded-md border">
              {usersLoading ? (
                <p className="p-4 text-center text-sm text-muted-foreground">Loading...</p>
              ) : nonMembers.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  {allUsers.length === 0 ? "No other users" : "All users are already members"}
                </p>
              ) : (
                nonMembers.map((user) => {
                  const selected = selectedIds.has(user.id);
                  const initials = user.full_name
                    ? user.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    : "?";
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => toggleUser(user.id)}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="h-8 w-8">
                        {user.avatar_url && <AvatarImage src={user.avatar_url} alt={user.full_name} />}
                        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                      </Avatar>
                      <span className="flex-1 text-sm">
                        {user.full_name || "Unnamed user"}
                      </span>
                      {selected && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>

            {selectedIds.size > 0 && (
              <p className="text-xs text-muted-foreground">
                {selectedIds.size} user{selectedIds.size !== 1 ? "s" : ""} selected
              </p>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={closeAddView}
                disabled={adding}
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              <Button
                className="flex-1"
                onClick={addMembers}
                disabled={adding || selectedIds.size === 0}
              >
                {adding
                  ? "Adding..."
                  : selectedIds.size > 0
                    ? `Add ${selectedIds.size} member${selectedIds.size !== 1 ? "s" : ""}`
                    : "Add Members"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
