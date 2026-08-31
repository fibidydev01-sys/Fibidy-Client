import { BannerSection } from "@/components/marketing/banner-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { WhySection } from "@/components/marketing/why-section";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { FAQSection } from "@/components/marketing/faq-section";
import { ContactSection } from "@/components/marketing/contact-section";
import { FooterSection } from "@/components/marketing/footer-section";

export default function MarketingPage() {
  return (
    <>
      <BannerSection />
      <HeroSection />
      <WhySection />
      <HowItWorksSection />
      <PricingSection />
      <FAQSection />
      <ContactSection />
      <FooterSection />
    </>
  );
}
