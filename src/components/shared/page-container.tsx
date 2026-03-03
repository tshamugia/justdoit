import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("container mx-auto max-w-3xl px-4 py-6", className)}>
      {children}
    </div>
  );
}
