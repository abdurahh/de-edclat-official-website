"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useState, type ReactNode } from "react";
import {
  getSeedAssetsForPath,
  waitForPageImages
} from "@/lib/preload-assets";

const RING_SIZE = 168;
const RING_STROKE = 1.75;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

type BrandLoaderProps = {
  children: ReactNode;
};

export function BrandLoader({ children }: BrandLoaderProps) {
  const pathname = usePathname();
  const skipIntro = pathname.startsWith("/admin");

  const [progress, setProgress] = useState(0);
  // Overlay is owned by effects so SSR stays aligned; hard loads use the CSS shell.
  const [showOverlay, setShowOverlay] = useState(false);
  const [gateReady, setGateReady] = useState(skipIntro);

  useLayoutEffect(() => {
    function finishIntro() {
      document.documentElement.dataset.intro = "done";
      setProgress(1);
      setShowOverlay(false);
      setGateReady(true);
    }

    if (skipIntro) {
      finishIntro();
      return;
    }

    const signal = { cancelled: false };
    setGateReady(false);
    setProgress(0);
    setShowOverlay(true);
    document.documentElement.dataset.intro = "pending";

    async function run() {
      // Let the new route commit so product <img> nodes exist under the overlay.
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      );
      await new Promise((resolve) => setTimeout(resolve, 40));

      if (signal.cancelled) return;

      await waitForPageImages({
        root: document.body,
        seedAssets: getSeedAssetsForPath(pathname),
        signal,
        onProgress: (value) => {
          if (!signal.cancelled) setProgress(value);
        }
      });

      if (signal.cancelled) return;
      finishIntro();
    }

    void run();

    return () => {
      signal.cancelled = true;
    };
  }, [pathname, skipIntro]);

  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <>
      <AnimatePresence>
        {showOverlay ? (
          <motion.div
            key={`brand-loader-${pathname}`}
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

      {/* Keep page mounted under the overlay so every image can fetch. */}
      <div className={gateReady ? undefined : "pointer-events-none select-none"}>
        {children}
      </div>
    </>
  );
}
