import { Zap } from "lucide-react";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export function Logo() {
  return (
    <Link href="/feed" className="flex items-center gap-2 font-bold text-lg">
      <Zap className="h-5 w-5 text-primary" />
      <span>{APP_NAME}</span>
    </Link>
  );
}
