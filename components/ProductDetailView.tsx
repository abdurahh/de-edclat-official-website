"use client";

import Image from "next/image";
import { useState } from "react";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { productInquiryMessage } from "@/lib/whatsapp";
import {
  detailFieldsForCategory,
  formatJewelryStone,
  formatJewelryWeight,
  formatPrice,
  getJewelryStones,
  stockLabel,
  type Product
} from "@/lib/types/product";

type ProductDetailViewProps = {
  product: Product;
};

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const images =
    product.images.length > 0
      ? product.images
      : ["/images/watch-cover.jpeg"];
  const [activeIndex, setActiveIndex] = useState(0);
  const fields = detailFieldsForCategory(product.category);
  const visibleDetails = fields.filter((field) => {
    if (field.key === "weight") {
      return formatJewelryWeight(product.details).length > 0;
    }
    const value = product.details[field.key];
    return typeof value === "string" && value.trim().length > 0;
  });
  const stones =
    product.category === "jewelry" ? getJewelryStones(product.details) : [];

  function detailValue(key: (typeof fields)[number]["key"]): string {
    if (key === "weight") return formatJewelryWeight(product.details);
    const value = product.details[key];
    return typeof value === "string" ? value : "";
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
      <div>
        <div className="card-media relative aspect-[4/5] w-full overflow-hidden bg-mist">
          <Image
            src={images[activeIndex]}
            alt={`${product.brand} ${product.name}`}
            fill
            priority
            quality={92}
            sizes="(min-width: 1024px) 40vw, 92vw"
            className="object-cover"
          />
        </div>
        {images.length > 1 ? (
          <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`card-media relative aspect-square overflow-hidden border transition ${
                  index === activeIndex
                    ? "border-ruby/50"
                    : "border-transparent opacity-75 hover:opacity-100"
                }`}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  loading="eager"
                  sizes="120px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col">
        <p className="caps-label caps-28 text-xs font-semibold uppercase text-ruby">
          {product.brand}
        </p>
        <h1 className="mt-4 font-display text-4xl leading-tight text-charcoal sm:text-5xl">
          {product.name}
        </h1>
        <p className="mt-6 font-display text-3xl text-charcoal">
          {formatPrice(product.price, product.currency)}
        </p>
        <p className="mt-3 text-sm uppercase tracking-[0.22em] text-slate">
          {stockLabel(product.stock_status)}
          {product.condition ? ` · ${product.condition}` : ""}
          {product.category === "gemstone" && product.gemstone_color_name
            ? ` · ${product.gemstone_color_name}`
            : ""}
        </p>

        {visibleDetails.length > 0 || stones.length > 0 ? (
          <dl className="mt-10 divide-y divide-ruby/10 border-y border-ruby/10">
            {visibleDetails.map((field) => (
              <div
                key={field.key}
                className="grid grid-cols-[8.5rem_1fr] gap-4 py-4 text-sm sm:grid-cols-[10rem_1fr]"
              >
                <dt className="uppercase tracking-[0.18em] text-slate">
                  {field.label}
                </dt>
                <dd className="text-charcoal">{detailValue(field.key)}</dd>
              </div>
            ))}
            {stones.map((stone, index) => (
              <div
                key={`stone-${index}-${stone.name}`}
                className="grid grid-cols-[8.5rem_1fr] gap-4 py-4 text-sm sm:grid-cols-[10rem_1fr]"
              >
                <dt className="uppercase tracking-[0.18em] text-slate">
                  {stones.length > 1 ? `Stone ${index + 1}` : "Stone"}
                </dt>
                <dd className="text-charcoal">{formatJewelryStone(stone)}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <WhatsAppButton message={productInquiryMessage(product)} />
        </div>

        {product.description ? (
          <p className="mt-8 max-w-lg text-base leading-8 text-slate">
            {product.description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
