"use client";

import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/shared/page-container";

export default function FeedError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <PageContainer>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
        <Button onClick={reset} className="mt-4">
          Try again
        </Button>
      </div>
    </PageContainer>
  );
}
