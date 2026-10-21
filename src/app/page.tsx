import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { Teams } from "@/components/landing/Teams";
import { Vision } from "@/components/landing/Vision";
import { Faq } from "@/components/landing/Faq";
import { Story } from "@/components/prelaunch/Story";
import { WhatYouGet } from "@/components/prelaunch/WhatYouGet";

export default function Home() {
  return (
    <div className="min-h-screen font-sans">
      <SiteNav />
      <Hero />
      <Story />
      <HowItWorks />
      <WhatYouGet />
      <Pricing />
      <Teams />
      <Vision />
      <Faq />
      <SiteFooter />
    </div>
  );
}
