"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, LayoutDashboard, Settings, Wallet } from "lucide-react";
import { UserNav } from "@/components/auth/user-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { RingMark } from "@/components/brand/ring-mark";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

const navItems = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/transactions", label: "Lịch sử", icon: Wallet },
  { href: "/reports", label: "Báo cáo", icon: BarChart3 },
  { href: "/settings", label: "Cài đặt", icon: Settings },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function WorkspaceTopBar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userName = session?.user?.name?.trim();
  const pageTitle =
    navItems.find((item) => isActivePath(pathname, item.href))?.label ?? "";

  return (
    <header className="relative z-30 shrink-0 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6 lg:px-10 xl:px-14">
        <Link href="/dashboard" className="flex min-h-11 items-center gap-2.5">
          <RingMark className="h-7 w-7 shrink-0" />
          <span className="hidden text-sm font-semibold tracking-wide whitespace-nowrap text-foreground lg:inline">
            PERSONAL FINANCE
          </span>
        </Link>

        {/* Tiêu đề trang hiện tại — chỉ mobile (desktop đã có nav đánh dấu) */}
        {pageTitle ? (
          <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-sm font-semibold whitespace-nowrap text-foreground lg:hidden">
            {pageTitle}
          </span>
        ) : null}

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-14 items-center px-4 text-sm font-medium transition-colors",
                  active
                    ? "text-emerald-700"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-emerald-600" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          {userName && (
            <span className="mr-1 hidden text-xs text-muted-foreground xl:inline">
              {userName}
            </span>
          )}
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
