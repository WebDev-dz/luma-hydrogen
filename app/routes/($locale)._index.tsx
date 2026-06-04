import {Await, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/($locale)._index';
import {Suspense} from 'react';
import {ArrowRight} from 'lucide-react';
import {Image} from '@shopify/hydrogen';
import heroPlaceholder from '~/assets/hero_placeholder.jpg';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import {MockShopNotice} from '~/components/MockShopNotice';
import FeaturedCollection from '~/components/FeaturedCollection';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Luma | Considered Objects for Modern Living'}];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context}: Route.LoaderArgs) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
  ]);
  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
    featuredCollection: collections.nodes[0],
    collections: collections.nodes,
  };
}

function loadDeferredData({context}: Route.LoaderArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error: Error) => {
      console.error(error);
      return null;
    });
  return {recommendedProducts};
}

const marqueeItems = [
  'FREE SHIPPING WORLDWIDE',
  'NEW ARRIVALS WEEKLY',
  'SUSTAINABLE PACKAGING',
  'HANDCRAFTED WITH INTENTION',
];

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="home">
      {data.isShopLinked ? null : <MockShopNotice />}
      <Hero collection={data.featuredCollection} />
      <div className="overflow-hidden border-y border-border bg-ink py-3 text-background">
        <div className="marquee flex w-max items-center gap-12 whitespace-nowrap">
          {[...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems].map((t, i) => (
            <span key={i} className="inline-flex items-center gap-12 text-[11px] font-medium uppercase tracking-[0.25em]">
              {t}
              <span className="text-primary">◆</span>
            </span>
          ))}
        </div>
      </div>
      <FeaturedCollection collections={data.collections || []} />
      <RecommendedProducts products={data.recommendedProducts} />
    </div>
  );
}

function Hero({collection}: {collection: FeaturedCollectionFragment}) {
  const image = collection?.image;
  const imageSrc = image?.url ?? heroPlaceholder;
  const imageAlt = image?.altText ?? 'Luma interior';
  return (
    <section className="relative">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 lg:grid-cols-2 lg:gap-10 lg:px-10 lg:py-16">
        <div className="flex flex-col justify-center bg-cream px-8 py-16 lg:px-14 lg:py-24">
          <h1 className="font-serif text-5xl leading-[1.05] text-foreground sm:text-6xl lg:text-7xl">
            Light.
            <br />
            Luxury.
            <br />
            Yours.
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
            Discover a new standard of living through curated design and mindful
            craftsmanship. Elevating your everyday environment.
          </p>
          <div className="mt-9">
            <a
              href="#edit"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground transition-all hover:bg-primary/90"
            >
              Explore Collection
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden lg:aspect-auto">
          <Image
            src={imageSrc}
            alt={imageAlt}
            className="h-full w-full object-cover"
            width={1600}
            height={1280}
          />
        </div>
      </div>
    </section>
  );
}

function RecommendedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <section className="mx-auto max-w-7xl px-2 sm:px-6 md:px-8 py-20 lg:px-10" aria-labelledby="recommended-products">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Curated
          </p>
          <h2 id="recommended-products" className="font-serif text-3xl">
            New Arrivals
          </h2>
        </div>
      </div>
      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {Array.from({length: 4}).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
        }
      >
        <Await resolve={products}>
          {(response) => (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {response
                ? response.products.nodes.map((product, i) => (
                    <ProductItem
                      key={product.id}
                      product={product}
                      loading={i < 4 ? 'eager' : undefined}
                    />
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
    </section>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 3, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
