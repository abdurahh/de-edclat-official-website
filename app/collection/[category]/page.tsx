import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const collections = {
  jewelry: {
    title: "Jewelry",
    eyebrow: "Bespoke Collection",
    accent: "jewelry"
  },
  watch: {
    title: "Watch",
    eyebrow: "Timepiece Collection",
    accent: "watch"
  },
  "precious-stone": {
    title: "Precious Stone",
    eyebrow: "Stone Collection",
    accent: "stone"
  }
} as const;

type CollectionKey = keyof typeof collections;

function isCollectionKey(category: string): category is CollectionKey {
  return category in collections;
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
    title: `${collections[category].title} Coming Soon | De Eclat`,
    description: `${collections[category].title} collection page coming soon from De Eclat.`
  };
}

export default async function CollectionComingSoonPage({
  params
}: CollectionPageProps) {
  const { category } = await params;

  if (!isCollectionKey(category)) {
    notFound();
  }

  const collection = collections[category];

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-8">
      <div
        aria-hidden
        className="absolute left-1/2 top-28 h-72 w-72 -translate-x-1/2 rounded-full bg-ruby/10 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-champagne/80 blur-3xl"
      />

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between rounded-full border border-ruby/10 bg-pearl/70 px-5 py-3 shadow-soft backdrop-blur-2xl">
        <Link href="/" className="font-script text-3xl leading-none text-ruby">
          De Eclat
        </Link>
        <Link
          href="/#collection"
          className="nav-cta rounded-full border border-ruby/20 text-xs font-semibold uppercase text-ruby transition hover:bg-ruby hover:text-pearl"
        >
          Back
        </Link>
      </nav>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-6.5rem)] max-w-6xl items-center py-16">
        <div className="w-full overflow-hidden rounded-[2.75rem] border border-ruby/10 bg-white/50 shadow-jewel backdrop-blur-2xl">
          <div className="relative grid min-h-[34rem] content-center overflow-hidden px-7 py-16 text-center sm:px-12 lg:px-20">
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-ruby/10 via-champagne/55 to-transparent"
            />
            <div
              aria-hidden
              className="absolute -bottom-16 -left-14 h-52 w-[120%] rotate-[-4deg] rounded-[50%] bg-ruby/10"
            />
            <div
              aria-hidden
              className="absolute -bottom-24 left-1/4 h-52 w-[110%] rotate-[5deg] rounded-[50%] bg-charcoal/10"
            />

            <div
              aria-hidden
              className="absolute right-[12%] top-1/2 hidden h-64 w-64 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(253,251,247,0.95),rgba(246,239,230,0.72)_34%,rgba(179,27,27,0.24)_72%,rgba(179,27,27,0.42))] shadow-soft lg:block"
            />

            <div className="relative z-10 mx-auto max-w-3xl">
              <p className="caps-label caps-28 text-xs font-semibold uppercase text-ruby">
                {collection.eyebrow}
              </p>
              <h1 className="mt-10 font-display text-5xl leading-none tracking-[0.16em] text-charcoal sm:text-7xl lg:text-8xl">
                Coming Soon
              </h1>
              <p className="mx-auto mt-8 max-w-xl text-base leading-8 text-slate">
                The {collection.title.toLowerCase()} collection page is being
                prepared for a future launch.
              </p>
              <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/#collection"
                  className="inline-flex items-center justify-center rounded-full border border-ruby/15 bg-pearl px-8 py-4 text-xs font-semibold uppercase tracking-[0.28em] text-ruby transition hover:border-ruby/30 hover:bg-white"
                >
                  Collection
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full bg-ruby px-8 py-4 text-xs font-semibold uppercase tracking-[0.28em] text-pearl transition hover:bg-charcoal"
                >
                  Inquire
                </Link>
              </div>
            </div>

            <p className="absolute left-7 top-7 font-script text-2xl leading-none text-ruby">
              De Eclat
            </p>
            <p className="absolute bottom-7 right-7 hidden text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-ruby/50 sm:block">
              {collection.accent}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
