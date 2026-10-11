import { Inter } from "next/font/google";

/**
 * Font của phong cách "Sạch & tài chính": Inter cho mọi vai —
 * tiêu đề semibold, chữ thường và số tiền (tabular-nums qua class .pf-mono).
 */
export const pfDisplay = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700"],
  variable: "--font-pf-display",
});

export const pfMono = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-pf-mono",
});

export const pfBody = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  variable: "--font-pf-body",
});

export const pfFontVars = `${pfDisplay.variable} ${pfMono.variable} ${pfBody.variable}`;
