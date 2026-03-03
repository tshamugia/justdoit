"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/use-profile";
import { useWorkspaces } from "@/hooks/use-workspace";
import { useWorkspaceContext } from "@/providers/workspace-provider";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";
import { useRealtimeRsvps } from "@/hooks/use-realtime-rsvps";
import { AppHeader } from "@/components/layout/app-header";
import { MobileNav } from "@/components/layout/mobile-nav";

interface AuthUser {
  id: string;
  email: string;
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { activeWorkspace, setActiveWorkspace } = useWorkspaceContext();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setUser({ id: data.id, email: data.email });
        }
        setLoading(false);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  const { data: profile } = useProfile(user?.id);
  const { data: workspaces } = useWorkspaces(user?.id);

  // Auto-select first workspace if none active
  useEffect(() => {
    if (workspaces?.length && !activeWorkspace) {
      setActiveWorkspace(workspaces[0]);
    }
  }, [workspaces, activeWorkspace, setActiveWorkspace]);

  // Realtime subscriptions (no-op with SQLite)
  useRealtimeEvents(activeWorkspace?.id);
  useRealtimeRsvps(activeWorkspace?.id);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <AppHeader userId={user!.id} profile={profile} />
      <main>{children}</main>
      <MobileNav />
    </div>
  );
}
