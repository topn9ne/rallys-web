import type { Metadata } from "next";
import { Archivo_Black, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  subsets: ["latin"],
  weight: ["400"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Railside Rides — Pedal. Party. Repeat.",
  description:
    "A 14-seat bar on wheels in Grand Island. Private 2-hour tours — BYOB, bring the crew, we bring the route.",
  openGraph: {
    title: "Railside Rides — Pedal. Party. Repeat.",
    description:
      "A 14-seat bar on wheels in Grand Island. Private 2-hour tours — BYOB, bring the crew, we bring the route.",
    type: "website",
    siteName: "Railside Rides",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivoBlack.variable} ${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-foreground">
        {children}
      </body>
    </html>
  );
}
