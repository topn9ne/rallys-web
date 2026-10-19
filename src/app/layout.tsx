import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Rally's Indoor Training — Start a Rally",
  description:
    "Self-service batting cages coming to Hastings, NE. Get on the list.",
  openGraph: {
    title: "Rally's Indoor Training — Start a Rally",
    description:
      "Self-service batting cages coming to Hastings, NE. Get on the list.",
    type: "website",
    siteName: "Rally's Indoor Training",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${barlow.variable} ${barlowCondensed.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col text-foreground">
        {children}
      </body>
    </html>
  );
}
