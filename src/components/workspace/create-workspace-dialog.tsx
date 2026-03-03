"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createWorkspaceSchema,
  type CreateWorkspaceFormData,
} from "@/lib/validators";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useWorkspaceContext } from "@/providers/workspace-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Check, ChevronLeft, Search } from "lucide-react";
import { toast } from "sonner";

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

function Avatar({ user }: { user: AppUser }) {
  const initials = user.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  if (user.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.full_name}
        className="h-8 w-8 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
      {initials}
    </div>
  );
}

export function CreateWorkspaceDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const queryClient = useQueryClient();
  const { setActiveWorkspace } = useWorkspaceContext();

  const { data: allUsers = [], isLoading: usersLoading } = useAllUsers(open);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
    reset,
  } = useForm<CreateWorkspaceFormData>({
    resolver: zodResolver(createWorkspaceSchema),
  });

  const filteredUsers = allUsers.filter((u) =>
    u.full_name.toLowerCase().includes(search.toLowerCase())
  );

  function toggleUser(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleClose(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) {
      reset();
      setStep(1);
      setSearch("");
      setSelectedIds(new Set());
    }
  }

  async function createWorkspace() {
    setLoading(true);
    const name = getValues("name");
    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, memberIds: Array.from(selectedIds) }),
    });

    if (!res.ok) {
      const body = await res.json();
      toast.error(body.error ?? "Failed to create workspace");
      setLoading(false);
      return;
    }

    const raw = await res.json();
    const workspace = {
      id: raw.id,
      name: raw.name,
      invite_code: raw.inviteCode,
      created_by: raw.createdBy,
      created_at: raw.createdAt,
      is_default: false,
    };

    setActiveWorkspace(workspace);
    queryClient.invalidateQueries({ queryKey: queryKeys.workspaces(userId) });
    toast.success(`Workspace "${workspace.name}" created!`);
    handleClose(false);
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-1 h-4 w-4" /> New Workspace
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Create Workspace" : "Add Members"}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <form
            onSubmit={handleSubmit(() => setStep(2))}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="ws-name">Workspace Name</Label>
              <Input
                id="ws-name"
                placeholder="My Team"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Next: Add Members
            </Button>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Search members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="max-h-64 overflow-y-auto rounded-md border">
              {usersLoading ? (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  Loading...
                </p>
              ) : filteredUsers.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  No users found
                </p>
              ) : (
                filteredUsers.map((user) => {
                  const selected = selectedIds.has(user.id);
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => toggleUser(user.id)}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted/50 transition-colors"
                    >
                      <Avatar user={user} />
                      <span className="flex-1 text-sm">
                        {user.full_name || "Unnamed user"}
                      </span>
                      {selected && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {selectedIds.size > 0 && (
              <p className="text-xs text-muted-foreground">
                {selectedIds.size} member{selectedIds.size !== 1 ? "s" : ""}{" "}
                selected
              </p>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              <Button
                className="flex-1"
                onClick={createWorkspace}
                disabled={loading}
              >
                {loading
                  ? "Creating..."
                  : selectedIds.size > 0
                    ? `Create with ${selectedIds.size} member${selectedIds.size !== 1 ? "s" : ""}`
                    : "Create Workspace"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
