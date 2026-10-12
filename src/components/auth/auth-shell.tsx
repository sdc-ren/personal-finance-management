import type { ReactNode } from "react";
import Link from "next/link";
import { AuthVisual } from "@/components/auth/auth-visual";
import { pfFontVars } from "@/lib/fonts";
import { RingMark } from "@/components/brand/ring-mark";
import { ThemeToggle } from "@/components/layout/theme-toggle";

interface AuthShellProps {
  mode: "login" | "register";
  title: string;
  description: string;
  children: ReactNode;
}

const proofPoints = [
  { label: "MIỄN PHÍ", value: "100%" },
  { label: "CẦN THẺ", value: "KHÔNG" },
  { label: "TIỀN TỆ", value: "VND" },
];

export function AuthShell({ mode, title, description, children }: AuthShellProps) {
  const isLogin = mode === "login";

  return (
    <div className={pfFontVars}>
      <main className="flex min-h-screen flex-col">
        <header className="border-b border-(--steel)">
          <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-10">
            <Link href="/" className="flex min-h-11 items-center gap-2.5">
              <RingMark className="h-7 w-7" />
              <span className="pf-display text-sm font-semibold tracking-[0.12em] whitespace-nowrap text-(--text-bright) max-[430px]:hidden">
                PERSONAL FINANCE
              </span>
            </Link>

            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              <Link
                href={isLogin ? "/register" : "/login"}
                className="pf-display flex h-11 items-center rounded-sm border border-(--ring-steel) px-4 text-sm font-semibold tracking-wide whitespace-nowrap text-(--text-steel) transition-colors hover:border-(--track-yellow) hover:text-(--track-yellow-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--track-yellow)"
              >
                {isLogin ? "TẠO TÀI KHOẢN" : "ĐĂNG NHẬP"}
              </Link>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-10 px-4 py-8 sm:px-6 lg:grid lg:grid-cols-[1fr_minmax(0,480px)] lg:items-center lg:gap-16 lg:px-10 lg:py-12 xl:px-16">
          {/* Cột trái: visual đúng theme mới, chỉ hiện trên màn rộng */}
          <aside className="hidden lg:block">
            <div className="mx-auto max-w-lg">
              <AuthVisual className="h-auto w-full" />
              <dl className="pf-mono mt-4 grid max-w-md grid-cols-3 gap-px border border-(--steel) bg-(--steel)">
                {proofPoints.map((p) => (
                  <div key={p.label} className="bg-(--vacuum) p-3">
                    <dt className="text-[10px] tracking-[0.14em] text-(--text-steel)">{p.label}</dt>
                    <dd className="mt-1 text-sm font-semibold text-(--track-yellow-ink)">{p.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>

          {/* Cột phải: form */}
          <section className="mx-auto w-full max-w-md border border-(--steel) bg-(--pf-subtle)/60 p-5 sm:p-7 lg:mx-0 lg:max-w-none">
            <div className="mb-6 space-y-2">
              <h1 className="pf-display text-2xl font-bold tracking-tight text-(--text-bright) sm:text-3xl">
                {title}
              </h1>
              <p className="text-sm leading-relaxed text-(--text-steel)">{description}</p>
            </div>
            {children}
          </section>
        </div>

        <footer className="pf-mono border-t border-(--steel) px-4 py-4 text-[11px] tracking-wide text-(--text-steel) sm:px-6 lg:px-10">
          PERSONAL FINANCE · SỔ DÒNG TIỀN CỦA BẠN
        </footer>
      </main>
    </div>
  );
}
