import { FooterCta } from "@/components/landing/FooterCta";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Nav } from "@/components/landing/Nav";
import { Pricing } from "@/components/landing/Pricing";
import { Ticker } from "@/components/landing/Ticker";
import { Teams } from "@/components/landing/Teams";
import { Faq } from "@/components/landing/Faq";

export default function Home() {
  return (
    <div
      className="min-h-screen font-sans"
      style={{
        background: "var(--color-landing-bg)",
        color: "var(--color-landing-fg)",
      }}
    >
      <Nav />
      <Hero />
      <Ticker />
      <HowItWorks />
      <Pricing />
      <Teams />
      <Faq />
      <FooterCta />
    </div>
  );
}
