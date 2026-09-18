import Link from "next/link";
import { NavSocialLinks } from "@/components/NavSocialLinks";

function WatchIcon({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block bg-current ${className ?? ""}`.trim()}
      style={{
        maskImage: "url(/icons/watch.png)",
        WebkitMaskImage: "url(/icons/watch.png)",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center"
      }}
    />
  );
}

function RingIcon({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block bg-current ${className ?? ""}`.trim()}
      style={{
        maskImage: "url(/icons/jewelry-ring.png)",
        WebkitMaskImage: "url(/icons/jewelry-ring.png)",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center"
      }}
    />
  );
}

const iconLinkClass =
  "inline-flex items-center justify-center p-1 text-ruby transition-colors duration-300 hover:text-charcoal";

const iconClass =
  "h-5 w-5 [filter:drop-shadow(0_0_0.45px_currentColor)_drop-shadow(0_0_0.45px_currentColor)]";

const textLinkClass =
  "caps-label caps-28 whitespace-nowrap text-charcoal transition-colors duration-300 hover:text-ruby";

export function SiteHeader() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-3 py-3 sm:px-5 sm:py-5">
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between rounded-full border border-ruby/10 bg-pearl/70 px-3 py-2.5 shadow-soft backdrop-blur-2xl sm:px-6 sm:py-3">
        <Link
          href="/"
          className="relative z-10 shrink-0 font-script text-[1.65rem] leading-none text-ruby sm:text-3xl"
        >
          De Eclat
        </Link>

        {/* Mobile: centered icons only (≤455px) */}
        <div className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-7 nav:hidden">
          <Link href="/collection/watch" className={iconLinkClass} aria-label="Watch">
            <WatchIcon className={iconClass} />
          </Link>
          <Link href="/collection/jewelry" className={iconLinkClass} aria-label="Jewelry">
            <RingIcon className={iconClass} />
          </Link>
        </div>

        {/* Desktop: text labels (≥456px) */}
        <div className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 text-[0.65rem] font-semibold uppercase sm:gap-8 sm:text-xs nav:flex">
          <Link href="/collection/watch" className={textLinkClass}>
            Watch
          </Link>
          <Link href="/collection/jewelry" className={textLinkClass}>
            Jewelry
          </Link>
        </div>

        <div className="relative z-10 shrink-0">
          <NavSocialLinks />
        </div>
      </nav>
    </header>
  );
}
