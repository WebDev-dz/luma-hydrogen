import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {ArrowRight, PackageOpen} from 'lucide-react';
import type {CollectionFragment} from 'storefrontapi.generated';

export function CollectionCard({
  collection,
  index,
}: {
  collection: CollectionFragment;
  index: number;
}) {
  const isLarge = index % 7 === 0 || index % 7 === 6;

  return (
    <Link
      to={`/collections/${collection.handle}`}
      prefetch="intent"
      className={`group relative block overflow-hidden rounded-lg bg-cream ${isLarge ? 'sm:col-span-2 lg:col-span-1' : ''}`}
    >
      <div className="aspect-4/5 overflow-hidden">
        {collection.image ? (
          <Image
            alt={collection.image.altText || collection.title}
            data={collection.image}
            loading={index < 6 ? 'eager' : undefined}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <PackageOpen className="h-12 w-12 text-muted-foreground/40" strokeWidth={1} />
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

      <span className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-[10px] font-medium text-foreground backdrop-blur-sm">
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h2 className="font-serif text-2xl leading-snug text-white">
          {collection.title}
        </h2>
        <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-white/70 transition-all duration-300 group-hover:gap-2.5 group-hover:text-white">
          Explore
          <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}
