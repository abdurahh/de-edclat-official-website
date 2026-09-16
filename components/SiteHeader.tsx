import Link from "next/link";
import { NavSocialLinks } from "@/components/NavSocialLinks";

export function SiteHeader() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-5 py-5">
      <nav className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center rounded-full border border-ruby/10 bg-pearl/70 px-4 py-3 shadow-soft backdrop-blur-2xl sm:px-6">
        <Link
          href="/"
          className="justify-self-start font-script text-3xl leading-none text-ruby"
        >
          De Eclat
        </Link>
        <div className="flex items-center gap-8 text-xs font-medium uppercase text-charcoal/70">
          <Link href="/collection/watch" className="caps-label caps-28">
            Watch
          </Link>
          <Link href="/collection/jewelry" className="caps-label caps-28">
            Jewelry
          </Link>
        </div>
        <div className="justify-self-end">
          <NavSocialLinks />
        </div>
      </nav>
    </header>
  );
}
