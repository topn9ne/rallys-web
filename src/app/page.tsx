import { Nav } from "@/components/prelaunch/Nav";
import { Hero } from "@/components/prelaunch/Hero";
import { Story } from "@/components/prelaunch/Story";
import { HowItWorks } from "@/components/prelaunch/HowItWorks";
import { WhatYouGet } from "@/components/prelaunch/WhatYouGet";
import { Vision } from "@/components/prelaunch/Vision";
import { Gallery } from "@/components/prelaunch/Gallery";
import { WaitlistCta } from "@/components/prelaunch/WaitlistCta";
import { Footer } from "@/components/prelaunch/Footer";

export default function Home() {
  return (
    <div className="min-h-screen font-sans">
      <Nav />
      <Hero />
      <Story />
      <HowItWorks />
      <WhatYouGet />
      <Vision />
      <Gallery />
      <WaitlistCta />
      <Footer />
    </div>
  );
}
