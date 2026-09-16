"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

type ProductCardProps = {
  title: string;
  eyebrow: string;
  href: string;
  image: string;
  imagePosition?: string;
  className?: string;
};

export function ProductCard({
  title,
  eyebrow,
  href,
  image,
  imagePosition = "center center",
  className = ""
}: ProductCardProps) {
  return (
    <Link
      href={href}
      className={`block h-full ${className}`.trim()}
      aria-label={`${title} coming soon`}
    >
      <motion.article
        whileHover={{ scale: 1.02, y: -8 }}
        transition={{ type: "spring", stiffness: 180, damping: 22 }}
        className="card-shell group flex h-full flex-col rounded-[2rem] border border-ruby/8 bg-white/60 p-2.5 shadow-soft backdrop-blur-xl transition-shadow duration-500 hover:shadow-jewel"
      >
        <div className="card-media relative aspect-[4/5] w-full shrink-0 rounded-[1.65rem] bg-mist">
          <Image
            src={image}
            alt={title}
            fill
            quality={90}
            sizes="(min-width: 1024px) 22rem, 88vw"
            style={{ objectPosition: imagePosition }}
            className="object-cover brightness-[1.03] saturate-[0.88] contrast-[0.98] transition duration-700 ease-out group-hover:scale-[1.04]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-pearl/45 via-pearl/5 to-white/20"
          />
        </div>
        <div className="card-body mt-auto flex min-h-[5.5rem] items-end justify-between gap-6 px-4 py-5">
          <div>
            <p className="caps-label caps-36 text-xs font-medium uppercase text-ruby/70">
              {eyebrow}
            </p>
            <h3 className="mt-2 font-display text-2xl leading-snug text-charcoal">
              {title}
            </h3>
          </div>
          <span className="h-px w-14 shrink-0 bg-ruby/25 transition-all duration-500 group-hover:w-20" />
        </div>
      </motion.article>
    </Link>
  );
}
