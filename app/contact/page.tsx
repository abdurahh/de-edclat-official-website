import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function ContactPage() {
  return (
    <main className="min-h-screen px-5 py-8">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-ruby/10 bg-pearl/70 px-5 py-3 shadow-soft backdrop-blur-2xl">
        <Link href="/" className="font-script text-3xl leading-none text-ruby">
          De Eclat
        </Link>
        <Link
          href="/"
          className="nav-cta rounded-full border border-ruby/20 text-xs font-semibold uppercase text-ruby transition hover:bg-ruby hover:text-pearl"
        >
          Home
        </Link>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-10 py-20 lg:grid-cols-[0.88fr_1.12fr] lg:py-28">
        <ScrollReveal className="self-start">
          <p className="section-eyebrow text-xs font-semibold uppercase text-ruby">
            Exclusive Invitation
          </p>
          <h1 className="mt-6 font-display text-5xl leading-tight text-charcoal sm:text-7xl">
            For discreet B2B inquiries and private appointments.
          </h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-slate">
            Send a focused email inquiry to begin a conversation with De Eclat.
            The phone number is provided for manual dialing only.
          </p>

          <div className="mt-12 grid gap-5">
            <div className="card-shell rounded-[2rem] border border-ruby/10 bg-white/50 p-6 shadow-soft backdrop-blur-xl">
              <p className="caps-label caps-35 text-xs font-semibold uppercase text-ruby">
                Phone
              </p>
              <p className="mt-4 text-lg text-charcoal">HK: +852-6097 0143</p>
            </div>

            <div className="card-shell rounded-[2rem] border border-ruby/10 bg-white/50 p-6 shadow-soft backdrop-blur-xl">
              <p className="caps-label caps-35 text-xs font-semibold uppercase text-ruby">
                Email
              </p>
              <p className="mt-4 text-lg text-charcoal">deeclat@gmail.com</p>
            </div>
          </div>
        </ScrollReveal>

        <div className="lg:pt-12">
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
