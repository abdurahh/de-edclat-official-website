import type { Metadata } from "next";
import { Montserrat, Pinyon_Script, Playfair_Display } from "next/font/google";
import "./globals.css";

const pinyon = Pinyon_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pinyon"
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair"
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat"
});

export const metadata: Metadata = {
  title: "De Eclat | Diamonds, Watches & Bespoke Jewelry",
  description:
    "A luxury brand promotion website for De Eclat and DIALUSTER INC., serving Hong Kong and Tokyo with 15+ years of jewelry and watch authority.",
  metadataBase: new URL("https://deeclat.example")
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${pinyon.variable} ${playfair.variable} ${montserrat.variable} bg-pearl font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
