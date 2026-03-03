"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  joinWorkspaceSchema,
  type JoinWorkspaceFormData,
} from "@/lib/validators";
import { useJoinWorkspace } from "@/hooks/use-join-workspace";
import { useWorkspaceContext } from "@/providers/workspace-provider";
import { useWorkspaces } from "@/hooks/use-workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function JoinWorkspaceForm({ userId }: { userId: string }) {
  const router = useRouter();
  const joinWorkspace = useJoinWorkspace(userId);
  const { setActiveWorkspace } = useWorkspaceContext();
  const { data: workspaces } = useWorkspaces(userId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinWorkspaceFormData>({
    resolver: zodResolver(joinWorkspaceSchema),
  });

  const onSubmit = async (data: JoinWorkspaceFormData) => {
    try {
      const workspaceId = await joinWorkspace.mutateAsync(data.inviteCode);
      // Find the workspace after refetch
      const ws = workspaces?.find((w) => w.id === workspaceId);
      if (ws) setActiveWorkspace(ws);
      toast.success("Joined workspace!");
      router.push("/feed");
    } catch (err: any) {
      toast.error(err.message || "Failed to join workspace");
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Join a Workspace</CardTitle>
        <CardDescription>
          Enter the invite code shared by your team
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inviteCode">Invite Code</Label>
            <Input
              id="inviteCode"
              placeholder="e.g. a1b2c3d4"
              {...register("inviteCode")}
            />
            {errors.inviteCode && (
              <p className="text-sm text-destructive">
                {errors.inviteCode.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={joinWorkspace.isPending}
          >
            {joinWorkspace.isPending ? "Joining..." : "Join Workspace"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
