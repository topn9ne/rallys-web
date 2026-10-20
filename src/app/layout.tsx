import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Rally's Indoor Training — Start a Rally",
  description:
    "Self-service batting cages in Hastings, NE. Book a cage, get a door code, hit.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Rally's",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  openGraph: {
    title: "Rally's Indoor Training — Start a Rally",
    description:
      "Self-service batting cages in Hastings, NE. Book a cage, get a door code, hit.",
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
      <head>
        <meta name="theme-color" content="#1B2A4A" />
      </head>
      <body className="min-h-full flex flex-col text-foreground">
        {children}
      </body>
    </html>
  );
}
