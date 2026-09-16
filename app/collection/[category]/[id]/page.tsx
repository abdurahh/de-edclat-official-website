import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/ProductDetailView";
import { getActiveProductById } from "@/lib/products";
import type { ProductCategory } from "@/lib/types/product";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{
    category: string;
    id: string;
  }>;
};

const validCategories = new Set<ProductCategory>(["watch", "jewelry"]);

export async function generateMetadata({
  params
}: ProductPageProps): Promise<Metadata> {
  const { id, category } = await params;
  if (!validCategories.has(category as ProductCategory)) {
    return {};
  }

  const product = await getActiveProductById(id);
  if (!product || product.category !== category) {
    return { title: "Product | De Eclat" };
  }

  return {
    title: `${product.brand} ${product.name} | De Eclat`,
    description:
      product.description ??
      `${product.brand} ${product.name} available for private inquiry.`
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { category, id } = await params;

  if (!validCategories.has(category as ProductCategory)) {
    notFound();
  }

  const product = await getActiveProductById(id);

  if (!product || product.category !== category) {
    notFound();
  }

  return (
    <main className="min-h-screen px-5 pt-28 pb-24">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/collection/${category}`}
          className="caps-label caps-28 text-xs font-semibold uppercase text-ruby/70 transition hover:text-ruby"
        >
          ← {category === "watch" ? "Watch" : "Jewelry"}
        </Link>
        <div className="mt-10">
          <ProductDetailView product={product} />
        </div>
      </div>
    </main>
  );
}
