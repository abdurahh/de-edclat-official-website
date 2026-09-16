"use client";

import { useEffect, useRef, useState } from "react";

const EMAIL = "hello@deeclat.com";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12.04 2C6.58 2 2.15 6.36 2.15 11.72c0 1.89.52 3.73 1.51 5.36L2 22l5.09-1.61a10.1 10.1 0 0 0 4.95 1.26h.01c5.46 0 9.89-4.36 9.89-9.72S17.5 2 12.04 2Zm5.77 13.78c-.24.67-1.39 1.23-1.92 1.31-.49.07-1.11.1-1.79-.11-.41-.13-.94-.3-1.62-.59-2.85-1.22-4.7-4.06-4.84-4.25-.14-.19-1.15-1.52-1.15-2.9 0-1.38.73-2.06.99-2.34.26-.28.57-.35.76-.35h.55c.17 0 .4-.06.63.48.24.56.81 1.97.88 2.11.07.14.12.31.02.5-.1.19-.14.31-.28.48-.14.17-.3.38-.42.51-.14.14-.28.29-.12.56.16.28.71 1.16 1.52 1.88 1.05.93 1.93 1.22 2.21 1.36.28.14.44.12.6-.07.17-.19.7-.8.89-1.08.19-.28.38-.23.63-.14.26.1 1.63.76 1.91.9.28.14.47.21.54.32.07.12.07.67-.17 1.34Z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

const iconButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-ruby/20 text-ruby transition duration-500 hover:bg-ruby hover:text-pearl";

export function NavSocialLinks() {
  const [mailPinned, setMailPinned] = useState(false);
  const [mailHovered, setMailHovered] = useState(false);
  const mailRef = useRef<HTMLDivElement>(null);

  const showEmail = mailPinned || mailHovered;

  useEffect(() => {
    if (!mailPinned) return;

    function handlePointerDown(event: MouseEvent) {
      if (!mailRef.current?.contains(event.target as Node)) {
        setMailPinned(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [mailPinned]);

  return (
    <div className="flex items-center gap-2">
      <a
        href="https://instagram.com"
        target="_blank"
        rel="noopener noreferrer"
        className={iconButtonClass}
        aria-label="Instagram"
      >
        <InstagramIcon className="h-4 w-4" />
      </a>
      <a
        href="https://whatsapp.com"
        target="_blank"
        rel="noopener noreferrer"
        className={iconButtonClass}
        aria-label="WhatsApp"
      >
        <WhatsAppIcon className="h-4 w-4" />
      </a>
      <div
        ref={mailRef}
        className="relative"
        onMouseEnter={() => setMailHovered(true)}
        onMouseLeave={() => setMailHovered(false)}
      >
        <button
          type="button"
          className={`${iconButtonClass} ${mailPinned ? "bg-ruby text-pearl" : ""}`}
          aria-label={
            mailPinned
              ? "Email address visible — click again to hide"
              : "Show email address"
          }
          aria-expanded={showEmail}
          onClick={() => setMailPinned((pinned) => !pinned)}
        >
          <MailIcon className="h-4 w-4" />
        </button>
        <div
          className={`absolute right-0 top-full z-50 pt-2 transition duration-300 ${
            showEmail
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-1 opacity-0"
          }`}
        >
          <p
            className="select-all whitespace-nowrap rounded-full border border-ruby/15 bg-pearl/95 px-3.5 py-2 text-xs tracking-wide text-charcoal shadow-soft backdrop-blur-xl"
            title="Select to copy"
          >
            {EMAIL}
          </p>
        </div>
      </div>
    </div>
  );
}
