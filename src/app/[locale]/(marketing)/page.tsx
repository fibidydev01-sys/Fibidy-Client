import { BannerSection } from "@/components/marketing/banner-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { WhatIsSection } from "@/components/marketing/what-is-section";
import { WhySection } from "@/components/marketing/why-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { WhoIsItForSection } from "@/components/marketing/who-is-it-for-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { FAQSection } from "@/components/marketing/faq-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { ContactSection } from "@/components/marketing/contact-section";

export default function MarketingPage() {
  return (
    <>
      <HeroSection />
      <WhatIsSection />
      <WhySection />
      <FeaturesSection />
      <HowItWorksSection />
      <WhoIsItForSection />
      <PricingSection />
      <FAQSection />
      <CtaSection />
      <ContactSection />
    </>
  );
}
