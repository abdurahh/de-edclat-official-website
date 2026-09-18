"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { PRELOAD_ASSETS } from "@/lib/preload-assets";

export const INTRO_SESSION_KEY = "deeclat-intro-loaded";

const RING_SIZE = 168;
const RING_STROKE = 1.75;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

type BrandLoaderProps = {
  children: ReactNode;
};

function loadAsset(src: string): Promise<void> {
  return new Promise((resolve) => {
    const image = new window.Image();
    image.decoding = "async";
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
  });
}

function hasCompletedIntro(): boolean {
  try {
    return sessionStorage.getItem(INTRO_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function BrandLoader({ children }: BrandLoaderProps) {
  const pathname = usePathname();
  const skipIntro = pathname.startsWith("/admin");

  const [progress, setProgress] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [contentReady, setContentReady] = useState(skipIntro);

  useEffect(() => {
    function finishIntro() {
      document.documentElement.dataset.intro = "done";
      setShowOverlay(false);
      setContentReady(true);
    }

    if (skipIntro) {
      finishIntro();
      return;
    }

    if (hasCompletedIntro()) {
      setProgress(1);
      finishIntro();
      return;
    }

    document.documentElement.dataset.intro = "pending";
    setShowOverlay(true);

    let cancelled = false;
    let loaded = 0;
    const total = PRELOAD_ASSETS.length;

    async function run() {
      await Promise.all(
        PRELOAD_ASSETS.map(async (src) => {
          await loadAsset(src);
          if (cancelled) return;
          loaded += 1;
          setProgress(loaded / total);
        })
      );

      if (cancelled) return;

      setProgress(1);

      try {
        sessionStorage.setItem(INTRO_SESSION_KEY, "1");
      } catch {
        // Ignore persistence failures.
      }

      finishIntro();
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [skipIntro]);

  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <>
      <AnimatePresence>
        {showOverlay ? (
          <motion.div
            key="brand-loader"
            className="fixed inset-0 z-[200] flex items-center justify-center bg-pearl"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            role="status"
            aria-live="polite"
            aria-busy="true"
            aria-label="Loading De Eclat"
          >
            <div
              className="relative flex items-center justify-center"
              style={{ width: RING_SIZE, height: RING_SIZE }}
            >
              <svg
                className="pointer-events-none absolute inset-0 -rotate-90"
                width={RING_SIZE}
                height={RING_SIZE}
                viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
                aria-hidden
              >
                <circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_RADIUS}
                  fill="none"
                  stroke="rgba(179, 27, 27, 0.12)"
                  strokeWidth={RING_STROKE}
                />
                <circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_RADIUS}
                  fill="none"
                  stroke="#B31B1B"
                  strokeWidth={RING_STROKE}
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={dashOffset}
                  style={{
                    transition:
                      "stroke-dashoffset 180ms cubic-bezier(0.4, 0, 0.2, 1)"
                  }}
                />
              </svg>

              {/* eslint-disable-next-line @next/next/no-img-element -- brand mark during intro */}
              <img
                src="/brand/deeclat-icon-primary.svg"
                alt=""
                width={88}
                height={88}
                className="relative z-10 h-[5.5rem] w-[5.5rem] object-contain"
                draggable={false}
              />
            </div>
            <span className="sr-only">
              Loading {Math.round(progress * 100)} percent
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div
        className={
          contentReady
            ? "opacity-100 transition-opacity duration-200 ease-out"
            : "pointer-events-none opacity-0"
        }
        aria-hidden={!contentReady}
      >
        {children}
      </div>
    </>
  );
}
