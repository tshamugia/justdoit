"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Plus, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/feed", label: "Feed", icon: CalendarDays },
  { href: "/events/create", label: "Create", icon: Plus },
  { href: "/workspace/join", label: "Join", icon: Users },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
