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
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 200, damping: 24 }}
        className="card-shell group flex h-full flex-col"
      >
        <div className="card-media relative aspect-[3/4] w-full overflow-hidden bg-mist">
          <Image
            src={image}
            alt={`${product.brand} ${product.name}`}
            fill
            quality={90}
            sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-pearl/30 via-transparent to-transparent"
          />
        </div>
        <div className="card-body mt-5 space-y-2 px-1">
          <p className="caps-label caps-28 text-[0.65rem] font-semibold uppercase text-ruby/70">
            {product.brand}
          </p>
          <h3 className="font-display text-2xl leading-snug text-charcoal">
            {product.name}
          </h3>
          {highlight ? (
            <p className="text-sm text-slate">{highlight}</p>
          ) : null}
          <div className="flex items-baseline justify-between gap-4 pt-1">
            <p className="text-sm font-medium tracking-wide text-charcoal">
              {formatPrice(product.price, product.currency)}
            </p>
            <p className="text-[0.65rem] uppercase tracking-[0.22em] text-slate">
              {stockLabel(product.stock_status)}
            </p>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
