import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { AuthorityCounter } from "@/components/AuthorityCounter";
import { TradingCitiesTicker } from "@/components/TradingCitiesTicker";

const products = [
  {
    title: "Fine Jewelry",
    eyebrow: "Bespoke",
    image: "/images/necklace-cover.jpeg",
    imagePosition: "center 42%",
    className: "lg:mt-24"
  },
  {
    title: "Luxury Timepieces",
    eyebrow: "Servicing",
    image: "/images/watch-cover.jpeg",
    imagePosition: "center center",
    className: ""
  },
  {
    title: "Precious Stones",
    eyebrow: "Trading",
    image: "/images/precious-stone.jpeg",
    imagePosition: "center 38%",
    className: "lg:mt-14"
  }
];

const services = [
  "Diamond cutting and high-grade stone sourcing",
  "Private viewings for trusted B2B partners",
  "Luxury watch servicing and trade consultation",
  "Bespoke jewelry introductions and appointments"
];

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <header className="fixed left-0 right-0 top-0 z-50 px-5 py-5">
        <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-ruby/10 bg-pearl/70 px-5 py-3 shadow-soft backdrop-blur-2xl">
          <Link href="/" className="font-script text-3xl leading-none text-ruby">
            De Eclat
          </Link>
          <div className="hidden items-center gap-8 text-xs font-medium uppercase text-charcoal/70 md:flex">
            <a href="#collection" className="caps-label caps-28">
              Collection
            </a>
            <a href="#services" className="caps-label caps-28">
              Services
            </a>
            <a href="#presence" className="caps-label caps-28">
              Presence
            </a>
          </div>
          <Link
            href="/contact"
            className="nav-cta rounded-full border border-ruby/20 text-xs font-semibold uppercase text-ruby transition hover:bg-ruby hover:text-pearl"
          >
            Inquire
          </Link>
        </nav>
      </header>

      <section className="relative flex min-h-screen items-center px-5 py-28">
        <Image
          src="/images/hero-diamond.svg"
          alt="Soft diamond illustration for De Eclat"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-pearl/20 backdrop-blur-[1px]" />
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <ScrollReveal className="max-w-3xl">
            <p className="section-eyebrow text-xs font-semibold uppercase text-ruby">
              Hong Kong
            </p>
            <h1 className="mt-8 font-script text-[5rem] leading-[0.85] text-ruby sm:text-[8rem] lg:text-[10rem]">
              De Eclat
            </h1>
            <p className="mt-7 max-w-xl font-display text-3xl leading-tight text-charcoal sm:text-5xl">
              A quietly confident authority in diamonds, stones and timepieces.
            </p>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate">
              For over 15 years, De Eclat has served jewelers, buyers and
              trusted partners through a disciplined supply network spanning
              Hong Kong and Tokyo.
            </p>
          </ScrollReveal>
          <ScrollReveal className="hidden lg:block">
            <div className="rounded-[2.5rem] border border-white/60 bg-white/30 p-4 shadow-soft backdrop-blur-xl">
              <div className="rounded-[2rem] border border-ruby/10 bg-pearl/70 p-10">
                <AuthorityCounter />
                <p className="caps-label caps-40 mt-4 text-sm uppercase text-slate">
                  Years of Authority
                </p>
                <TradingCitiesTicker />
                <div className="mt-10 h-px bg-ruby/20" />
                <p className="mt-8 text-lg leading-8 text-charcoal">
                  Top-tier inventory, transparent partnership and a spring-soft
                  digital atmosphere inspired by luxury stationery.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section id="collection" className="px-5 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal className="mx-auto max-w-3xl text-center">
            <p className="section-eyebrow text-xs font-semibold uppercase text-ruby">
              The Collection
            </p>
            <h2 className="mt-5 font-display text-4xl leading-tight text-charcoal sm:text-6xl">
              Minimal presentation, exceptional material presence.
            </h2>
          </ScrollReveal>
          <div className="mt-16 grid gap-6 lg:grid-cols-3 lg:gap-8">
            {products.map((product) => (
              <ScrollReveal key={product.title}>
                <ProductCard {...product} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="px-5 py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-10 rounded-[2.5rem] border border-ruby/10 bg-white/45 p-6 shadow-soft backdrop-blur-2xl md:p-12 lg:grid-cols-[0.9fr_1.1fr]">
          <ScrollReveal>
            <p className="section-eyebrow text-xs font-semibold uppercase text-ruby">
              Bespoke Services
            </p>
            <h2 className="mt-5 font-display text-4xl leading-tight text-charcoal sm:text-6xl">
              Built for serious buyers, never for mass retail.
            </h2>
            <p className="mt-6 text-base leading-8 text-slate">
              De Eclat is a corporate promotion and service platform for B2B
              inquiries, private sourcing and high-quality trade relationships.
            </p>
          </ScrollReveal>
          <div className="grid gap-4">
            {services.map((service, index) => (
              <ScrollReveal key={service}>
                <div className="card-shell flex gap-5 rounded-3xl border border-ruby/10 bg-pearl/65 p-6 backdrop-blur-xl">
                  <span className="font-display text-3xl text-ruby/70">
                    0{index + 1}
                  </span>
                  <p className="min-w-0 flex-1 font-display text-2xl leading-snug text-charcoal">
                    {service}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section id="presence" className="px-5 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal className="max-w-3xl">
            <p className="section-eyebrow text-xs font-semibold uppercase text-ruby">
              Heritage & Presence
            </p>
            <h2 className="mt-5 font-display text-4xl leading-tight text-charcoal sm:text-6xl">
              Hong Kong precision with a Tokyo point of trust.
            </h2>
          </ScrollReveal>
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <ScrollReveal>
              <article className="card-shell rounded-[2rem] border border-ruby/10 bg-white/50 p-4 shadow-soft backdrop-blur-xl">
                <div className="card-media relative aspect-[4/3] rounded-[1.5rem]">
                  <Image
                    src="/images/location-hong-kong.svg"
                    alt="Hong Kong architectural illustration"
                    fill
                    sizes="(min-width: 1024px) 45vw, 92vw"
                    className="object-cover"
                  />
                </div>
                <div className="card-body p-5">
                  <h3 className="font-display text-3xl text-charcoal">
                    De Eclat, Hong Kong
                  </h3>
                  <p className="mt-3 leading-7 text-slate">
                    Jordan, Kowloon headquarters supporting established jewelry
                    partners and high-volume buyers.
                  </p>
                </div>
              </article>
            </ScrollReveal>
            <ScrollReveal>
              <article className="card-shell rounded-[2rem] border border-ruby/10 bg-white/50 p-4 shadow-soft backdrop-blur-xl lg:mt-16">
                <div className="card-media relative aspect-[4/3] rounded-[1.5rem]">
                  <Image
                    src="/images/location-tokyo.svg"
                    alt="Tokyo architectural illustration"
                    fill
                    sizes="(min-width: 1024px) 45vw, 92vw"
                    className="object-cover"
                  />
                </div>
                <div className="card-body p-5">
                  <h3 className="font-display text-3xl text-charcoal">
                    DIALUSTER INC., Japan
                  </h3>
                  <p className="mt-3 leading-7 text-slate">
                    A Tokyo presence that reinforces international credibility
                    and disciplined service standards.
                  </p>
                </div>
              </article>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 sm:pb-32">
        <ScrollReveal className="mx-auto max-w-5xl rounded-[2.5rem] border border-ruby/10 bg-ruby px-8 py-16 text-center text-pearl shadow-jewel md:px-16">
          <p className="section-eyebrow text-xs font-semibold uppercase text-pearl/70">
            Private Inquiry
          </p>
          <h2 className="mt-5 font-display text-4xl leading-tight sm:text-6xl">
            Begin a measured conversation with De Eclat.
          </h2>
          <Link
            href="/contact"
            className="mt-10 inline-flex items-center justify-center rounded-full bg-pearl px-10 py-4 text-sm font-semibold uppercase tracking-[0.28em] text-ruby transition hover:bg-white"
          >
            Contact Us
          </Link>
        </ScrollReveal>
      </section>
    </main>
  );
}
