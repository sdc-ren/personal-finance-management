"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { LandingNav } from "./sections/nav";
import { Hero } from "./sections/hero";
import { Features } from "./sections/features";
import { HowItWorks } from "./sections/how-it-works";
import { VoiceDemo } from "./sections/voice-demo";
import { Reports } from "./sections/reports";
import { Pricing } from "./sections/pricing";
import { Faq } from "./sections/faq";
import { FinalCta } from "./sections/final-cta";
import { LandingFooter } from "./sections/footer";
import { StickyCta } from "./sections/sticky-cta";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Landing page viết lại hoàn toàn theo theme "Sạch & tài chính" của app.
 * Kiến trúc: composition các section độc lập + 2 primitive dùng chung
 * (Reveal, SectionHeading). Hiệu ứng cuộn bằng GSAP + ScrollTrigger.
 */
export function LandingPage() {
  useGSAP(() => {
    // dọn ScrollTrigger khi unmount để không rò rỉ giữa các lần điều hướng
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  });

  return (
    <div className="min-h-screen bg-[#F6F8F7] text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
      <LandingNav />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <VoiceDemo />
        <Reports />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <LandingFooter />
      <StickyCta />
    </div>
  );
}
