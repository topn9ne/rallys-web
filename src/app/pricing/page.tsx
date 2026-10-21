import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Pricing } from "@/components/landing/Pricing";
import { Teams } from "@/components/landing/Teams";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Rally's Indoor Training",
  description:
    "Simple pricing for self-service batting cages in Hastings, NE. Family memberships, team memberships, and drop-in sessions.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen font-sans">
      <SiteNav />
      <Pricing />
      <Teams />
      <SiteFooter />
    </div>
  );
}
