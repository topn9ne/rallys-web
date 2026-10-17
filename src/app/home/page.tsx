import { FooterCta } from "@/components/landing/FooterCta";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Nav } from "@/components/landing/Nav";
import { Pricing } from "@/components/landing/Pricing";
import { Teams } from "@/components/landing/Teams";
import { Vision } from "@/components/landing/Vision";
import { Faq } from "@/components/landing/Faq";

export default function Home() {
  return (
    <div className="min-h-screen font-sans">
      <Nav />
      <Hero />
      <HowItWorks />
      <Pricing />
      <Teams />
      <Vision />
      <Faq />
      <FooterCta />
    </div>
  );
}
