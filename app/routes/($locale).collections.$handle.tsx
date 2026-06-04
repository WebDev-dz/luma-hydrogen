import {redirect, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/($locale).collections.$handle';
import {getPaginationVariables, Analytics, Image} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductItem} from '~/components/ProductItem';
import type {ProductItemFragment} from 'storefrontapi.generated';
import {ChevronRight, PackageOpen} from 'lucide-react';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Luma | ${data?.collection.title ?? ''} Collection`}];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 12,
  });

  if (!handle) {
    throw redirect('/collections');
  }

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, ...paginationVariables},
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {collection};
}

function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Collection() {
  const {collection} = useLoaderData<typeof loader>();
  const productCount = collection.products.nodes.length;
  return (
    <div>
      {/* Breadcrumb bar */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <nav className="flex h-10 items-center">
            <ol className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em]">
              <li>
                <Link
                  to="/collections"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Collections
                </Link>
              </li>
              <li>
                <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
              </li>
              <li className="text-foreground">{collection.title}</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero grid */}
      <section className="relative border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 lg:grid-cols-2 lg:gap-10 lg:px-10 lg:py-16">
          <div className="flex flex-col justify-center bg-cream px-8 py-16 lg:px-14 lg:py-24">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
              Collection
            </p>
            <h1 className="font-serif text-5xl leading-[1.05] text-foreground lg:text-6xl">
              {collection.title}
            </h1>
            {collection.description && (
              <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
                {collection.description}
              </p>
            )}
            <p className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {productCount} {productCount === 1 ? 'product' : 'products'}
            </p>
          </div>
          <div className="relative aspect-square overflow-hidden lg:aspect-auto">
            {collection.image ? (
              <Image
                data={collection.image}
                loading="eager"
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <PackageOpen className="h-16 w-16 text-muted-foreground/30" strokeWidth={1} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
        {productCount === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-cream/40 py-24 text-center">
            <PackageOpen className="h-10 w-10 text-muted-foreground/60" strokeWidth={1.2} />
            <h3 className="mt-4 font-serif text-xl text-foreground">No products yet</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              This collection is being curated. Check back soon.
            </p>
            <Link
              to="/collections"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-cream"
            >
              Browse Collections
            </Link>
          </div>
        ) : (
          <PaginatedResourceSection<ProductItemFragment>
            connection={collection.products}
            resourcesClassName="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8"
          >
            {({node: product, index}) => (
              <ProductItem
                key={product.id}
                product={product}
                loading={index < 8 ? 'eager' : undefined}
              />
            )}
          </PaginatedResourceSection>
        )}
      </section>

      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </div>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
    compareAtPriceRange {
      minVariantPrice { ...MoneyProductItem }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        id
        url
        altText
        width
        height
      }
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
` as const;
