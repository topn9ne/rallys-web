import { Nav } from "@/components/landing/Nav";
import { FooterCta } from "@/components/landing/FooterCta";
import { FaqLoader } from "@/components/landing/FaqLoader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQs — Railside Rides",
  description: "Answers to common questions about Railside Rides — booking, what to bring, how it works, and more.",
};

export default function FaqsPage() {
  return (
    <div
      className="min-h-screen font-sans"
      style={{
        background: "var(--color-landing-bg)",
        color: "var(--color-landing-fg)",
      }}
    >
      <Nav />
      <FaqLoader />
      <FooterCta />
    </div>
  );
}
