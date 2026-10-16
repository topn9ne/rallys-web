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
  title: "Rally's Indoor Training — Book. Swing. Repeat.",
  description:
    "Self-service batting cages in Hastings, NE. Book a 30-minute cage online, get a door code, and hit.",
  openGraph: {
    title: "Rally's Indoor Training — Book. Swing. Repeat.",
    description:
      "Self-service batting cages in Hastings, NE. Book a 30-minute cage online, get a door code, and hit.",
    type: "website",
    siteName: "Rally's Indoor Training",
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
