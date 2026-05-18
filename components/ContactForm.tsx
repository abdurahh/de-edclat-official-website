"use client";

import { FormEvent, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const services = [
  "Diamonds",
  "Watch Servicing",
  "Bespoke Jewelry",
  "Private Appointment"
];

type FormStatus = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [selectedService, setSelectedService] = useState(services[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      subject: String(formData.get("subject") ?? selectedService),
      message: String(formData.get("message") ?? "")
    };

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      let data: { error?: string } = {};

      try {
        data = (await response.json()) as { error?: string };
      } catch {
        data = {};
      }

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(
          data.error ?? "Something went wrong. Please try again."
        );
        return;
      }

      setStatus("success");
      form.reset();
      setSelectedService(services[0]);
    } catch {
      setStatus("error");
      setErrorMessage("Unable to reach the server. Please try again.");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-[2rem] border border-ruby/10 bg-white/55 p-6 shadow-soft backdrop-blur-2xl md:p-10"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="caps-label caps-30 text-xs font-medium uppercase text-slate">
            Name
          </span>
          <input
            className="form-field mt-3 rounded-2xl"
            name="name"
            type="text"
            required
            disabled={status === "submitting"}
          />
        </label>
        <label className="block">
          <span className="caps-label caps-30 text-xs font-medium uppercase text-slate">
            Email
          </span>
          <input
            className="form-field mt-3 rounded-2xl"
            name="email"
            type="email"
            required
            disabled={status === "submitting"}
          />
        </label>
      </div>

      <div className="mt-5">
        <span className="caps-label caps-30 text-xs font-medium uppercase text-slate">
          Subject of Interest
        </span>
        <div className="relative mt-3">
          <input name="subject" type="hidden" value={selectedService} />
          <motion.button
            type="button"
            whileTap={{ scale: 0.99 }}
            onClick={() => setIsOpen((value) => !value)}
            className="form-field flex items-center justify-between rounded-2xl text-left"
            aria-expanded={isOpen}
            disabled={status === "submitting"}
          >
            <span>{selectedService}</span>
            <span className="text-ruby" aria-hidden="true">
              {isOpen ? "Close" : "Select"}
            </span>
          </motion.button>
          <AnimatePresence>
            {isOpen ? (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-ruby/10 bg-pearl/95 shadow-soft backdrop-blur-xl"
              >
                {services.map((service) => (
                  <button
                    key={service}
                    type="button"
                    onClick={() => {
                      setSelectedService(service);
                      setIsOpen(false);
                    }}
                    className="block w-full px-5 py-4 text-left text-sm text-charcoal transition hover:bg-ruby/5 hover:text-ruby"
                  >
                    {service}
                  </button>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <label className="mt-5 block">
        <span className="caps-label caps-30 text-xs font-medium uppercase text-slate">
          Message
        </span>
        <textarea
          className="form-field mt-3 min-h-40 rounded-2xl"
          name="message"
          required
          disabled={status === "submitting"}
        />
      </label>

      {status === "success" ? (
        <p
          role="status"
          className="mt-6 rounded-2xl border border-ruby/15 bg-ruby/5 px-5 py-4 text-sm leading-7 text-charcoal"
        >
          Thank you. Your inquiry has been sent and we will respond shortly.
        </p>
      ) : null}

      {status === "error" ? (
        <p
          role="alert"
          className="mt-6 rounded-2xl border border-ruby/20 bg-ruby/10 px-5 py-4 text-sm leading-7 text-ruby"
        >
          {errorMessage}
        </p>
      ) : null}

      <motion.button
        type="submit"
        whileHover={status === "idle" ? { scale: 1.015 } : undefined}
        whileTap={status === "idle" ? { scale: 0.985 } : undefined}
        disabled={status === "submitting"}
        className="caps-label caps-32 mt-7 w-full rounded-full bg-ruby px-8 py-4 text-sm font-semibold uppercase text-pearl shadow-jewel transition hover:bg-ruby/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "submitting" ? "Sending..." : "Send Email Inquiry"}
      </motion.button>
    </form>
    </motion.div>
  );
}
