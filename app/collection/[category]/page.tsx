import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CollectionProductCard } from "@/components/CollectionProductCard";
import { ContactFallback } from "@/components/WhatsAppButton";
import { ScrollReveal } from "@/components/ScrollReveal";
import { getActiveProductsByCategory } from "@/lib/products";
import type { ProductCategory } from "@/lib/types/product";

export const dynamic = "force-dynamic";

const collections = {
  jewelry: {
    title: "Jewelry",
    eyebrow: "Bespoke Collection",
    description:
      "Selected pieces presented with quiet clarity — inquire privately for viewing and availability."
  },
  watch: {
    title: "Watch",
    eyebrow: "Timepiece Collection",
    description:
      "Curated timepieces with measured detail. No checkout — reach us directly for each piece."
  }
} as const;

type CollectionKey = keyof typeof collections;

function isCollectionKey(category: string): category is CollectionKey {
  return category in collections;
}

function toProductCategory(category: CollectionKey): ProductCategory {
  return category;
}

type CollectionPageProps = {
  params: Promise<{
    category: string;
  }>;
};

export function generateStaticParams() {
  return Object.keys(collections).map((category) => ({ category }));
}

export async function generateMetadata({
  params
}: CollectionPageProps): Promise<Metadata> {
  const { category } = await params;

  if (!isCollectionKey(category)) {
    return {};
  }

  return {
    title: `${collections[category].title} | De Eclat`,
    description: collections[category].description
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { category } = await params;

  if (!isCollectionKey(category)) {
    notFound();
  }

  const collection = collections[category];
  const products = await getActiveProductsByCategory(
    toProductCategory(category)
  );

  return (
    <main className="relative min-h-screen overflow-hidden px-5 pt-28 pb-24">
      <div
        aria-hidden
        className="absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full bg-ruby/8 blur-3xl"
      />

      <section className="relative z-10 mx-auto max-w-6xl pt-10 pb-12 text-center">
        <ScrollReveal>
          <p className="caps-label caps-28 text-xs font-semibold uppercase text-ruby">
            {collection.eyebrow}
          </p>
          <h1 className="mt-6 font-display text-5xl leading-none tracking-[0.08em] text-charcoal sm:text-7xl">
            {collection.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate">
            {collection.description}
          </p>
        </ScrollReveal>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl">
        {products.length === 0 ? (
          <ContactFallback />
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
            {products.map((product) => (
              <ScrollReveal key={product.id}>
                <CollectionProductCard product={product} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>

      {products.length > 0 ? (
        <p className="relative z-10 mx-auto mt-20 max-w-7xl text-center text-sm text-slate">
          Prefer a private conversation?{" "}
          <Link href="/contact" className="text-ruby underline-offset-4 hover:underline">
            Contact us
          </Link>
          .
        </p>
      ) : null}
    </main>
  );
}
