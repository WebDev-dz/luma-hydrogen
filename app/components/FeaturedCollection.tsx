import React from 'react';
import {Link} from 'react-router';
import type {FeaturedCollectionFragment} from 'storefrontapi.generated';
import {Image} from '@shopify/hydrogen';
import { PackageOpen } from 'lucide-react';

type Props = {
  collections: Array<FeaturedCollectionFragment>;
  loading?: 'eager' | 'lazy';
};

const FeaturedCollection = ({
  collections,
  loading = 'lazy',
}: Props) => {
  return (
    <section className="mx-auto max-w-7xl px-2 sm:px-6 md:px-8 py-20 lg:px-10" aria-labelledby="featured-collections">
      <h2 id="featured-collections" className="font-serif text-4xl sm:text-5xl">Curated Collections</h2>
      {collections.length === 0 && (
          <div className="mt-10 flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-cream/40 py-20 text-center">
            <PackageOpen className="h-10 w-10 text-muted-foreground/60" strokeWidth={1.2} />
            <h3 className="mt-4 font-serif text-xl text-foreground">Collections coming soon</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Our curators are assembling the next selection. Please visit again shortly.
            </p>
          </div>
        )}
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        { collections.map((c) => (
          <Link
            key={c.id}
            to={`collections/${c.handle}`}
            className="group relative block aspect-[4/5] overflow-hidden rounded-lg"
          >
            <Image
              src={c.image?.url}
              alt={c.image?.altText ?? c.title}
              loading={loading}
            sizes="(min-width: 45em) 400px, 100vw"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <h3 className="absolute bottom-6 left-6 font-serif text-2xl text-white">
              {c.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCollection;
