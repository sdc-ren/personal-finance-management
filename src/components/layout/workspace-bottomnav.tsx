"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, LayoutDashboard, Settings, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuickAddFab } from "@/components/transaction/quick-add-fab";

const items = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/transactions", label: "Lịch sử", icon: Wallet },
  { href: "/reports", label: "Báo cáo", icon: BarChart3 },
  { href: "/settings", label: "Cài đặt", icon: Settings },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Điều hướng đáy cho mobile — tầm ngón cái. Ẩn/hiện thuần CSS (`lg:hidden`),
 * không dùng useMediaQuery: hook đó trả false khi SSR nên sẽ dựng bản mobile
 * rồi nhảy sang desktop sau khi hydrate.
 */
export function WorkspaceBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="relative z-30 shrink-0 border-t border-border bg-background/92 backdrop-blur-md lg:hidden">
      <div className="grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
        {items.map((item, index) => {
          const active = isActivePath(pathname, item.href);
          const cell = (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-h-14 flex-col items-center justify-center gap-1 transition-colors",
                active ? "text-emerald-700" : "text-muted-foreground"
              )}
            >
              {active && (
                <span className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-emerald-600" />
              )}
              <item.icon className="h-5 w-5" />
              <span className="text-[11px] font-medium">
                {item.label}
              </span>
            </Link>
          );

          // FAB chiếm ô giữa, chèn sau hai mục đầu
          if (index === 2) {
            return (
              <div key="fab-slot" className="contents">
                <div className="flex min-h-14 items-center justify-center">
                  <QuickAddFab />
                </div>
                {cell}
              </div>
            );
          }
          return cell;
        })}
      </div>
    </nav>
  );
}
