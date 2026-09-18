import Link from "next/link";
import { NavSocialLinks } from "@/components/NavSocialLinks";

export function SiteHeader() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-3 py-3 sm:px-5 sm:py-5">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-2 rounded-full border border-ruby/10 bg-pearl/70 px-3 py-2.5 shadow-soft backdrop-blur-2xl sm:gap-6 sm:px-6 sm:py-3">
        <Link
          href="/"
          className="shrink-0 font-script text-[1.65rem] leading-none text-ruby sm:text-3xl"
        >
          De Eclat
        </Link>

        <div className="flex min-w-0 items-center justify-center gap-3 text-[0.65rem] font-medium uppercase text-charcoal/70 sm:gap-8 sm:text-xs">
          <Link
            href="/collection/watch"
            className="caps-label caps-28 whitespace-nowrap"
          >
            Watch
          </Link>
          <Link
            href="/collection/jewelry"
            className="caps-label caps-28 whitespace-nowrap"
          >
            Jewelry
          </Link>
        </div>

        <div className="shrink-0">
          <NavSocialLinks />
        </div>
      </nav>
    </header>
  );
}
