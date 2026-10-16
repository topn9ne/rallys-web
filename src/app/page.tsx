import { FooterCta } from "@/components/landing/FooterCta";
import { Gallery } from "@/components/landing/Gallery";
import { Groups } from "@/components/landing/Groups";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Nav } from "@/components/landing/Nav";
import { Routes as ThemeRides } from "@/components/landing/Routes";
import { Ticker } from "@/components/landing/Ticker";
import { Sponsors } from "@/components/landing/Sponsors";

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
      <ThemeRides />
      <Gallery />
      <Groups />
      <Sponsors />
      <FooterCta />
    </div>
  );
}
