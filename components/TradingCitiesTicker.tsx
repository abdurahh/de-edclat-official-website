"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

const CITIES = [
  "Hong Kong",
  "Tokyo",
  "Bangkok",
  "Chanthaburi",
  "New York",
  "Colombo",
  "Mumbai",
  "Shanghai"
] as const;

const HOLD_SECONDS = 2.6;
const SCROLL_SECONDS = 0.9;
const ITEM_HEIGHT_PX = 40;

export function TradingCitiesTicker() {
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;

    let timeline: gsap.core.Timeline | null = null;

    const setup = () => {
      const firstItem = track.querySelector<HTMLElement>("[data-city]");
      if (!firstItem) return;

      const step = firstItem.offsetHeight || ITEM_HEIGHT_PX;
      viewport.style.height = `${step}px`;

      timeline?.kill();
      gsap.set(track, { y: 0, clearProps: "transform" });
      gsap.set(track, { y: 0 });

      timeline = gsap.timeline({ repeat: -1 });
      timeline.to({}, { duration: HOLD_SECONDS });

      for (let index = 1; index <= CITIES.length; index += 1) {
        timeline
          .to(track, {
            y: -step * index,
            duration: SCROLL_SECONDS,
            ease: "power3.inOut"
          })
          .to({}, { duration: HOLD_SECONDS });
      }

      timeline.set(track, { y: 0 });
    };

    setup();

    const resizeObserver = new ResizeObserver(setup);
    resizeObserver.observe(track);

    return () => {
      resizeObserver.disconnect();
      timeline?.kill();
    };
  }, []);

  const cities = [...CITIES, CITIES[0]];

  return (
    <div
      ref={viewportRef}
      className="mt-6 h-10 overflow-hidden"
      aria-live="polite"
      aria-label="Global trading connections"
    >
      <div ref={trackRef} className="flex flex-col will-change-transform">
        {cities.map((city, index) => (
          <p
            key={`${city}-${index}`}
            data-city
            className="flex h-10 shrink-0 items-center font-display text-lg tracking-[0.12em] text-ruby sm:text-xl"
          >
            {city}
          </p>
        ))}
      </div>
    </div>
  );
}
