/** Shared / route-seeded assets for the brand loading screen. */
export const CORE_ASSETS = [
  "/brand/deeclat-icon-primary.svg",
  "/brand/deeclat-icon-charcoal.svg",
  "/icons/watch.png",
  "/icons/jewelry-ring.png"
] as const;

export const HOME_ASSETS = [
  "/images/hero-diamond.svg",
  "/images/necklace-cover.jpeg",
  "/images/watch-cover.jpeg"
] as const;

/** @deprecated use CORE_ASSETS + getSeedAssetsForPath */
export const PRELOAD_ASSETS = [...CORE_ASSETS, ...HOME_ASSETS] as const;

export function getSeedAssetsForPath(pathname: string): string[] {
  const seeds = new Set<string>(CORE_ASSETS);

  if (pathname === "/" || pathname === "") {
    for (const asset of HOME_ASSETS) seeds.add(asset);
  }

  if (pathname.startsWith("/collection/jewelry")) {
    seeds.add("/images/necklace-cover.jpeg");
  }

  if (pathname.startsWith("/collection/watch")) {
    seeds.add("/images/watch-cover.jpeg");
  }

  return [...seeds];
}

export function loadAsset(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (!src || src.startsWith("data:")) {
      resolve();
      return;
    }

    const image = new window.Image();
    image.decoding = "async";
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
  });
}

function collectImageSources(root: ParentNode): string[] {
  const sources = new Set<string>();

  root.querySelectorAll("img").forEach((img) => {
    const current = img.currentSrc || img.getAttribute("src");
    if (current) sources.add(current);

    const srcset = img.getAttribute("srcset");
    if (srcset) {
      srcset.split(",").forEach((entry) => {
        const url = entry.trim().split(/\s+/)[0];
        if (url) sources.add(url);
      });
    }
  });

  return [...sources];
}

function waitForImgElement(img: HTMLImageElement): Promise<void> {
  if (img.complete && img.naturalWidth > 0) {
    return img.decode?.().catch(() => undefined) ?? Promise.resolve();
  }

  return new Promise((resolve) => {
    const done = () => resolve();
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
  });
}

type WaitOptions = {
  root: ParentNode;
  seedAssets?: string[];
  onProgress?: (progress: number) => void;
  signal?: { cancelled: boolean };
  /** Stop waiting after this many ms even if images are still pending. */
  timeoutMs?: number;
};

/**
 * Preloads seed URLs plus every <img> currently in the page tree,
 * waiting until the set of images stabilizes so below-the-fold media
 * is ready before the loader dismisses.
 */
export async function waitForPageImages({
  root,
  seedAssets = [],
  onProgress,
  signal,
  timeoutMs = 12000
}: WaitOptions): Promise<void> {
  const started = Date.now();
  const loaded = new Set<string>();
  let lastCount = -1;
  let stableTicks = 0;

  const report = () => {
    const total = Math.max(loaded.size + 1, lastCount, seedAssets.length, 1);
    onProgress?.(Math.min(0.98, loaded.size / total));
  };

  await Promise.all(
    seedAssets.map(async (src) => {
      await loadAsset(src);
      loaded.add(src);
      if (!signal?.cancelled) report();
    })
  );

  if (typeof document !== "undefined" && document.fonts?.ready) {
    await document.fonts.ready.catch(() => undefined);
  }

  while (!signal?.cancelled && Date.now() - started < timeoutMs) {
    const imgs = Array.from(root.querySelectorAll("img"));
    imgs.forEach((img) => {
      if (img.loading === "lazy") img.loading = "eager";
    });

    const sources = collectImageSources(root);
    const count = sources.length;

    await Promise.all(
      sources.map(async (src) => {
        if (loaded.has(src)) return;
        await loadAsset(src);
        loaded.add(src);
        if (!signal?.cancelled) report();
      })
    );

    await Promise.all(imgs.map((img) => waitForImgElement(img)));

    if (count === lastCount) {
      stableTicks += 1;
      if (stableTicks >= 3) break;
    } else {
      stableTicks = 0;
      lastCount = count;
    }

    await new Promise((resolve) => setTimeout(resolve, 80));
  }

  onProgress?.(1);
}
