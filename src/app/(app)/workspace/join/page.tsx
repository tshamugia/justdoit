"use client";

import { useEffect, useState } from "react";
import { JoinWorkspaceForm } from "@/components/workspace/join-workspace-form";
import { PageContainer } from "@/components/shared/page-container";

export default function JoinWorkspacePage() {
  const [userId, setUserId] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data?.id) setUserId(data.id);
      })
      .catch(() => {});
  }, []);

  if (!userId) return null;

  return (
    <PageContainer className="flex justify-center">
      <JoinWorkspaceForm userId={userId} />
    </PageContainer>
  );
}
