import {useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).collections._index';
import {getPaginationVariables} from '@shopify/hydrogen';
import type {CollectionFragment} from 'storefrontapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {PackageOpen} from 'lucide-react';
import {CollectionCard} from '~/components/CollectionCard';


export const meta: Route.MetaFunction = () => {
  return [{title: 'Luma | Collections'}];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 9,
  });

  const [{collections}] = await Promise.all([
    context.storefront.query(COLLECTIONS_QUERY, {
      variables: paginationVariables,
    }),
  ]);

  return {collections};
}

function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Collections() {
  const {collections} = useLoaderData<typeof loader>();

  return (
    <div>
      {/* Page Header */}
      <div className="border-b border-border bg-cream/60">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Browse
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h1 className="font-serif text-5xl leading-tight text-foreground lg:text-6xl">
              All Collections
            </h1>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-right">
              Explore our curated assortment of collections — each thoughtfully assembled for your home and life.
            </p>
          </div>
        </div>
      </div>

      {/* Collections Grid */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
        <PaginatedResourceSection<CollectionFragment>
          connection={collections}
          resourcesClassName="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {({node: collection, index}) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              index={index}
            />
          )}
        </PaginatedResourceSection>

        {collections.nodes.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-cream/40 py-24 text-center">
            <PackageOpen className="h-10 w-10 text-muted-foreground/60" strokeWidth={1.2} />
            <h3 className="mt-4 font-serif text-xl text-foreground">No collections yet</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Our curators are assembling the first selection. Please visit again shortly.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

const COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
  }
  query StoreCollections(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...Collection
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
` as const;
