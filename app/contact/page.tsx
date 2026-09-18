import { ContactForm } from "@/components/ContactForm";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function ContactPage() {
  return (
    <main className="min-h-screen px-5 pt-28">
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
              <p className="mt-4 text-lg text-charcoal">HK: +852 6142 6130</p>
            </div>

            <div className="card-shell rounded-[2rem] border border-ruby/10 bg-white/50 p-6 shadow-soft backdrop-blur-xl">
              <p className="caps-label caps-35 text-xs font-semibold uppercase text-ruby">
                Email
              </p>
              <p className="mt-4 text-lg text-charcoal">hello@deeclat.com</p>
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
