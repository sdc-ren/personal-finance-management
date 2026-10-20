import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./nprogress.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import { ProgressBarProvider } from "@/components/providers/progress-bar-provider";
import { ThemeProvider, THEME_BOOTSTRAP } from "@/components/providers/theme-provider";
import { pfFontVars } from "@/lib/fonts";

const SITE_URL = "https://finance-dusky-five.vercel.app";
const SITE_NAME = "Personal Finance";
const SITE_DESCRIPTION =
  "Ghi chi tiêu trong vài giây, đặt ngân sách theo danh mục, xem tiền tháng này đi đâu. Tiếng Việt, VND, miễn phí.";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Personal Finance — Sổ dòng tiền của bạn",
    template: "%s · Personal Finance",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "quản lý tài chính cá nhân",
    "ghi chi tiêu",
    "ngân sách",
    "sổ dòng tiền",
    "personal finance",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  // icon.svg + apple-icon.png trong src/app được Next tự sinh thẻ <link>
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Personal Finance — Sổ dòng tiền của bạn",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: "Personal Finance — Sổ dòng tiền của bạn",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        {/* Đặt theme trước khi vẽ. Ở <head> chứ không phải trong <body>: một
            element script nằm trong cây React của body làm lệch bộ đếm useId
            và sinh hydration mismatch cho mọi component Radix phía sau. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      {/* pfFontVars phải ở <body>: Dialog/Sheet/Select render qua portal ra
          document.body nên nếu đặt font ở lớp sâu hơn thì portal mất font. */}
      <body className={`${pfFontVars} antialiased`}>
        <ProgressBarProvider />
        <AuthProvider>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
