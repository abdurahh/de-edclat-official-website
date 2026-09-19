"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { NavSocialLinks } from "@/components/NavSocialLinks";

const NAV_LINKS = [
  { href: "/collection/watch", label: "Watch" },
  { href: "/collection/jewelry", label: "Jewelry" },
  { href: "/collection/diamond", label: "Diamond" },
  { href: "/collection/gemstone", label: "Gemstone" },
  { href: "/contact", label: "Contact" }
] as const;

const textLinkClass =
  "caps-label caps-28 whitespace-nowrap text-charcoal transition-colors duration-300 hover:text-ruby";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-3.5 w-5" aria-hidden>
      <span
        className={`absolute left-0 block h-[1.5px] w-full bg-current transition duration-300 ${
          open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
        }`}
      />
      <span
        className={`absolute left-0 top-1/2 block h-[1.5px] w-full -translate-y-1/2 bg-current transition duration-300 ${
          open ? "scale-x-0 opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`absolute left-0 block h-[1.5px] w-full bg-current transition duration-300 ${
          open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0"
        }`}
      />
    </span>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-3 py-3 sm:px-5 sm:py-5">
      <div className="relative mx-auto max-w-7xl">
        <nav className="relative flex items-center justify-between rounded-full border border-ruby/10 bg-pearl/70 px-3 py-2.5 shadow-soft backdrop-blur-2xl sm:px-6 sm:py-3">
          {/* Mobile: hamburger (left) */}
          <button
            type="button"
            className="relative z-10 inline-flex h-9 w-9 items-center justify-center rounded-full text-charcoal transition-colors duration-300 hover:text-ruby nav:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MenuIcon open={menuOpen} />
          </button>

          {/* Desktop: brand (left) */}
          <Link
            href="/"
            className="relative z-10 hidden shrink-0 font-script text-3xl leading-none text-ruby nav:inline"
          >
            De Eclat
          </Link>

          {/* Mobile: brand (center, nudged left for visual balance vs socials) */}
          <Link
            href="/"
            className="absolute left-[44%] top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 font-script text-[1.65rem] leading-none text-ruby nav:hidden"
          >
            De Eclat
          </Link>

          {/* Desktop: collection links (center) */}
          <div className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-5 text-[0.65rem] font-semibold uppercase sm:gap-6 sm:text-xs lg:gap-8 nav:flex">
            <Link href="/collection/watch" className={textLinkClass}>
              Watch
            </Link>
            <Link href="/collection/jewelry" className={textLinkClass}>
              Jewelry
            </Link>
            <Link href="/collection/diamond" className={textLinkClass}>
              Diamond
            </Link>
            <Link href="/collection/gemstone" className={textLinkClass}>
              Gemstone
            </Link>
          </div>

          <div className="relative z-10 shrink-0">
            <NavSocialLinks />
          </div>
        </nav>

        {/* Mobile expanded menu — absolute so a closed menu never blocks page taps */}
        <div
          id={menuId}
          className={`absolute left-0 right-0 top-full z-50 nav:hidden ${
            menuOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          {menuOpen ? (
            <button
              type="button"
              className="fixed inset-0 z-40 bg-charcoal/20 backdrop-blur-[2px]"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            />
          ) : null}

          <div
            className={`relative z-50 mt-2 overflow-hidden rounded-[1.75rem] border border-ruby/10 bg-pearl/95 shadow-soft backdrop-blur-2xl transition duration-300 ${
              menuOpen
                ? "translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-2 opacity-0"
            }`}
            aria-hidden={!menuOpen}
          >
            <ul className="flex flex-col px-2 py-3">
              {NAV_LINKS.map((link) => {
                const active = pathname.startsWith(link.href);

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`block rounded-2xl px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.22em] transition-colors duration-300 ${
                        active
                          ? "bg-ruby/8 text-ruby"
                          : "text-charcoal hover:bg-ruby/5 hover:text-ruby"
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}
