"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  formatJewelryWeight,
  formatPrice,
  getJewelryStones,
  stockLabel,
  type Product
} from "@/lib/types/product";

type CollectionProductCardProps = {
  product: Product;
};

export function CollectionProductCard({ product }: CollectionProductCardProps) {
  const href = `/collection/${product.category}/${product.id}`;
  const image = product.images[0] ?? "/images/watch-cover.jpeg";
  const stones = getJewelryStones(product.details);
  const highlight =
    product.category === "watch"
      ? product.details.reference_number || product.details.case_diameter
      : formatJewelryWeight(product.details) || stones[0]?.name;

  return (
    <Link href={href} className="block h-full" aria-label={`${product.brand} ${product.name}`}>
      <motion.article
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 200, damping: 24 }}
        className="group flex h-full flex-col overflow-hidden rounded-lg bg-mist"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-champagne">
          <Image
            src={image}
            alt={`${product.brand} ${product.name}`}
            fill
            quality={90}
            sizes="(min-width: 1024px) 28vw, 45vw"
            className="object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
          />
        </div>
        <div className="space-y-1 px-2.5 pb-3.5 pt-3 sm:space-y-2 sm:px-4 sm:pb-5 sm:pt-4">
          <p className="caps-label caps-28 text-[0.6rem] font-semibold uppercase text-ruby/70 sm:text-[0.65rem]">
            {product.brand}
          </p>
          <h3 className="font-display text-base leading-snug text-charcoal sm:text-xl">
            {product.name}
          </h3>
          {highlight ? (
            <p className="text-xs text-slate sm:text-sm">{highlight}</p>
          ) : null}
          <div className="flex items-baseline justify-between gap-2 pt-1.5 sm:gap-3 sm:pt-2">
            <p className="text-xs font-medium tracking-wide text-charcoal sm:text-sm">
              {formatPrice(product.price, product.currency)}
            </p>
            <p className="text-[0.55rem] uppercase tracking-[0.18em] text-slate sm:text-[0.65rem] sm:tracking-[0.22em]">
              {stockLabel(product.stock_status)}
            </p>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
