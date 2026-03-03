"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { Profile } from "@/lib/types/database.types";

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.profile(userId ?? ""),
    queryFn: async (): Promise<Profile> => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      const p = data.profile;
      return {
        id: data.id,
        full_name: p?.fullName ?? "",
        avatar_url: p?.avatarUrl ?? null,
        created_at: p?.createdAt ?? new Date().toISOString(),
        updated_at: p?.updatedAt ?? new Date().toISOString(),
      };
    },
    enabled: !!userId,
  });
}
