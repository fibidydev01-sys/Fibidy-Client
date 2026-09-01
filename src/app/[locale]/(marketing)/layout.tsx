import type { ReactNode } from "react";
import { Navbar } from "@/components/marketing/navbar";
import { FooterSection } from "@/components/marketing/footer-section";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div data-shape="site" className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-20">{children}</main>
      <FooterSection />
    </div>
  );
}