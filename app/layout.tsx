import type { Metadata } from "next";
import { Montserrat, Pinyon_Script, Playfair_Display } from "next/font/google";
import { BrandLoader } from "@/components/BrandLoader";
import { SiteHeader } from "@/components/SiteHeader";
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
    "A luxury brand promotion website for De Eclat, headquartered in Hong Kong with 15+ years of jewelry and watch authority.",
  metadataBase: new URL("https://deeclat.example")
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=location.pathname;if(p.indexOf("/admin")===0){document.documentElement.dataset.intro="done";return;}if(sessionStorage.getItem("deeclat-intro-loaded")==="1"){document.documentElement.dataset.intro="done";}else{document.documentElement.dataset.intro="pending";}}catch(e){document.documentElement.dataset.intro="pending";}})();`
          }}
        />
      </head>
      <body
        className={`${pinyon.variable} ${playfair.variable} ${montserrat.variable} bg-pearl font-sans antialiased`}
      >
        <div id="brand-intro-shell" className="brand-intro-shell" aria-hidden="true">
          <div className="brand-intro-mark">
            <svg
              className="brand-intro-ring"
              width="168"
              height="168"
              viewBox="0 0 168 168"
              aria-hidden
            >
              <circle
                cx="84"
                cy="84"
                r="83.125"
                fill="none"
                stroke="rgba(179, 27, 27, 0.12)"
                strokeWidth="1.75"
              />
            </svg>
            {/* eslint-disable-next-line @next/next/no-img-element -- static shell before hydration */}
            <img
              src="/brand/deeclat-icon-primary.svg"
              alt=""
              width={88}
              height={88}
              className="h-[5.5rem] w-[5.5rem] object-contain"
            />
          </div>
        </div>
        <BrandLoader>
          <SiteHeader />
          {children}
        </BrandLoader>
      </body>
    </html>
  );
}
