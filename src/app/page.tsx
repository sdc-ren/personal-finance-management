import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";
import { pfFontVars } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Personal Finance — Mỗi đồng chi ra đều để lại vết",
  description:
    "Ghi chi tiêu trong vài giây bằng giọng nói, ngân sách theo danh mục, báo cáo 6 tháng. Tiếng Việt, VND, miễn phí 100%.",
};

export default function LandingRoute() {
  return (
    <div className={pfFontVars}>
      <LandingPage />
    </div>
  );
}
