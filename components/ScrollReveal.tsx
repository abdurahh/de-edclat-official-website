"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  imageReveal?: boolean;
};

export function ScrollReveal({
  children,
  className = "",
  imageReveal = false
}: ScrollRevealProps) {
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      gsap.fromTo(
        scopeRef.current,
        {
          autoAlpha: 0,
          y: imageReveal ? 90 : 56,
          filter: imageReveal ? "blur(18px)" : "blur(8px)"
        },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.35,
          ease: "power4.out",
          scrollTrigger: {
            trigger: scopeRef.current,
            start: "top 82%",
            end: "bottom 58%",
            scrub: imageReveal ? 0.8 : false
          }
        }
      );
    }, scopeRef);

    return () => context.revert();
  }, [imageReveal]);

  return (
    <div ref={scopeRef} className={`overflow-visible ${className}`}>
      {children}
    </div>
  );
}
