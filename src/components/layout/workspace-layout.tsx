import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { WorkspaceTopBar } from "@/components/layout/workspace-topbar";
import { WorkspaceBottomNav } from "@/components/layout/workspace-bottomnav";
import { WorkspaceScrollReset } from "@/components/layout/workspace-scroll-reset";

interface WorkspaceLayoutProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  contentInnerClassName?: string;
  withPanel?: boolean;
  fullHeight?: boolean;
}

/**
 * App shell chiều cao cố định: <main> là scroll container, không phải window.
 *
 * Lý do không để document tự cuộn: chuỗi `h-full` đi từ đây xuống tận
 * TransactionList (react-window đo clientHeight của cha). Với min-h-screen thì
 * trên mobile chiều cao không xác định, `h-full` sập về auto, clientHeight = 0
 * và danh sách rơi vào fallback cứng 600px. `h-[100dvh]` + `flex-1 min-h-0`
 * cho chiều cao xác định ở cả hai breakpoint.
 */
export function WorkspaceLayout({
  children,
  className,
  contentClassName,
  contentInnerClassName,
  withPanel = true,
  fullHeight = false,
}: WorkspaceLayoutProps) {
  return (
    <div className={cn("flex h-[100dvh] flex-col overflow-hidden bg-background", className)}>
      <WorkspaceTopBar />

      <main
        id="pf-scroll"
        className={cn(
          "flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 lg:px-10 xl:px-14",
          contentClassName
        )}
      >
        <WorkspaceScrollReset />
        <div className={cn("flex flex-col gap-5", fullHeight && "h-full")}>
          {withPanel ? (
            <section
              className={cn(
                "flex-1 min-h-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
                contentInnerClassName
              )}
            >
              {children}
            </section>
          ) : (
            children
          )}
        </div>
      </main>

      <WorkspaceBottomNav />
    </div>
  );
}
