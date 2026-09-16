import Link from "next/link";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

type WhatsAppButtonProps = {
  message: string;
  label?: string;
  className?: string;
};

export function WhatsAppButton({
  message,
  label = "Inquire on WhatsApp",
  className = ""
}: WhatsAppButtonProps) {
  return (
    <a
      href={buildWhatsAppUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center rounded-full bg-[#25D366] px-8 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#1ebe57] ${className}`.trim()}
    >
      {label}
    </a>
  );
}

export function ContactFallback() {
  return (
    <div className="mx-auto max-w-xl rounded-[2rem] border border-ruby/10 bg-white/55 px-8 py-14 text-center shadow-soft backdrop-blur-xl">
      <p className="font-display text-3xl text-charcoal sm:text-4xl">
        Contact us for more products available offline
      </p>
      <p className="mt-5 text-base leading-8 text-slate">
        Our current online selection is limited. Reach out and we will share
        pieces available through private inquiry.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-full bg-ruby px-8 py-4 text-xs font-semibold uppercase tracking-[0.28em] text-pearl transition hover:bg-charcoal"
        >
          Contact page
        </Link>
        <WhatsAppButton message="Hello De Eclat — I'd like to ask about products available offline." />
      </div>
    </div>
  );
}
