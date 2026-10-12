import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 py-10 dark:border-slate-800">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-4 sm:flex-row sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600">
            <span className="h-2 w-2 rounded-full bg-white" />
          </span>
          <span className="pf-display text-sm font-bold text-slate-900 dark:text-white">
            Personal Finance
          </span>
        </Link>
        <p className="text-center text-xs text-slate-500">
          Mỗi đồng chi ra đều để lại vết · Miễn phí 100%
        </p>
        <div className="flex items-center gap-5 text-xs font-medium text-slate-500">
          <Link href="/login" className="transition-colors hover:text-emerald-700">
            Đăng nhập
          </Link>
          <Link href="/register" className="transition-colors hover:text-emerald-700">
            Đăng ký
          </Link>
        </div>
      </div>
    </footer>
  );
}
