"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const TARGET = 15;

export function AuthorityCounter() {
  const numberRef = useRef<HTMLSpanElement>(null);
  const plusRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const numberEl = numberRef.current;
    const plusEl = plusRef.current;
    if (!numberEl || !plusEl) return;

    const counter = { value: 0 };

    gsap.set(plusEl, { opacity: 0, y: 6 });

    const tween = gsap.to(counter, {
      value: TARGET,
      duration: 2.4,
      ease: "power2.out",
      delay: 0.4,
      onUpdate: () => {
        numberEl.textContent = String(Math.round(counter.value));
      },
      onComplete: () => {
        gsap.to(plusEl, {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: "power2.out"
        });
      }
    });

    return () => {
      tween.kill();
    };
  }, []);

  return (
    <p
      className="font-display text-6xl text-ruby"
      aria-label="15 plus years of authority"
    >
      <span ref={numberRef} suppressHydrationWarning>
        0
      </span>
      <span ref={plusRef} className="inline-block opacity-0" aria-hidden>
        +
      </span>
    </p>
  );
}
