"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const services = [
  "Diamonds",
  "Watch Servicing",
  "Bespoke Jewelry",
  "Private Appointment"
];

export function ContactForm() {
  const [selectedService, setSelectedService] = useState(services[0]);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.form
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="rounded-[2rem] border border-ruby/10 bg-white/55 p-6 shadow-soft backdrop-blur-2xl md:p-10"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="caps-label caps-30 text-xs font-medium uppercase text-slate">
            Name
          </span>
          <input className="form-field mt-3 rounded-2xl" name="name" type="text" />
        </label>
        <label className="block">
          <span className="caps-label caps-30 text-xs font-medium uppercase text-slate">
            Email
          </span>
          <input
            className="form-field mt-3 rounded-2xl"
            name="email"
            type="email"
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
        />
      </label>

      <motion.button
        type="submit"
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        className="caps-label caps-32 mt-7 w-full rounded-full bg-ruby px-8 py-4 text-sm font-semibold uppercase text-pearl shadow-jewel transition hover:bg-ruby/90"
      >
        Send Email Inquiry
      </motion.button>
    </motion.form>
  );
}
