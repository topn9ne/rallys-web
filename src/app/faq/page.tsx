import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { FaqPage as FaqContent } from "@/components/site/FaqPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Rally's Indoor Training",
  description:
    "Frequently asked questions about Rally's Indoor Training — self-service batting cages in Hastings, NE.",
};

export default function FaqPage() {
  return (
    <div className="min-h-screen font-sans">
      <SiteNav />
      <FaqContent />
      <SiteFooter />
    </div>
  );
}
