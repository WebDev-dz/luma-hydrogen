import {Link} from 'react-router';
import {Image, Money, Pagination} from '@shopify/hydrogen';
import {urlWithTrackingParams, type RegularSearchReturn} from '~/lib/search';
import EmptyState from './EmptyState';
import {ProductItem} from './ProductItem';
import {BookOpen, FileText} from 'lucide-react';

type SearchItems = RegularSearchReturn['result']['items'];
type PartialSearchResult<ItemType extends keyof SearchItems> = Pick<
  SearchItems,
  ItemType
> &
  Pick<RegularSearchReturn, 'term'>;

type SearchResultsProps = RegularSearchReturn & {
  children: (args: SearchItems & {term: string}) => React.ReactNode;
};

export function SearchResults({
  term,
  result,
  children,
}: Omit<SearchResultsProps, 'error' | 'type'>) {
  if (!result?.total) {
    return null;
  }

  return children({...result.items, term});
}

SearchResults.Articles = SearchResultsArticles;
SearchResults.Pages = SearchResultsPages;
SearchResults.Products = SearchResultsProducts;
SearchResults.Empty = SearchResultsEmpty;

function SearchResultsArticles({
  term,
  articles,
}: PartialSearchResult<'articles'>) {
  if (!articles?.nodes.length) {
    return null;
  }

  return (
    <div className="search-result">
      <h2>Articles</h2>
      <div>
        {articles?.nodes?.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.handle}`,
            trackingParams: article.trackingParameters,
            term,
          });
          const date = article.publishedAt
            ? new Date(article.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : null;

          return (
            <Link
              to={articleUrl}
              className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-foreground/40"
            >
              <div className="aspect-[4/3] overflow-hidden bg-secondary">
                {article.image?.url ? (
                  <img
                    src={article.image.url}
                    alt={article.image.altText ?? article.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                    <BookOpen className="h-8 w-8" strokeWidth={1.2} />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Journal{date ? ` · ${date}` : ''}
                </span>
                <h3 className="font-serif text-lg leading-snug text-foreground">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {article.excerpt}
                  </p>
                )}
                {article.authorV2?.name && (
                  <span className="mt-auto text-xs text-muted-foreground">
                    By {article.authorV2.name}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
      <br />
    </div>
  );
}

function SearchResultsPages({term, pages}: PartialSearchResult<'pages'>) {
  if (!pages?.nodes.length) {
    return null;
  }

  return (
    <div className="search-result">
      <h2>Pages</h2>
      <div>
        {pages?.nodes?.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term,
          });

          return (
            <div className="search-results-item" key={page.id}>
              <Link
                prefetch="intent"
                to={pageUrl}
                className="group flex items-start gap-4 py-5 transition-colors hover:bg-secondary/40"
              >
                <span className="mt-1 inline-flex h-9 w-9 flex-none items-center justify-center rounded-full border border-border text-muted-foreground">
                  <FileText className="h-4 w-4" strokeWidth={1.5} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-serif text-lg text-foreground group-hover:underline">
                    {page.title}
                  </h3>
                  {page.bodySummary && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {page.bodySummary}
                    </p>
                  )}
                  <span className="mt-1 block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    {pageUrl}
                  </span>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
      <br />
    </div>
  );
}

function SearchResultsProducts({
  term,
  products,
}: PartialSearchResult<'products'>) {
  if (!products?.nodes.length) {
    return null;
  }

  return (
    <div className="search-result">
      <div className="flex items-end justify-between border-b border-border pb-6">
        <h2 className="font-serif text-2xl">
          Results <span className="text-muted-foreground">for "{term}"</span>
        </h2>
        <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {products.nodes.length}{' '}
          {products.nodes.length === 1 ? 'piece' : 'pieces'}
        </span>
      </div>
      <Pagination connection={products}>
        {({nodes, isLoading, NextLink, PreviousLink}) => {
          const ItemsMarkup = nodes.map((product) => {
            const productUrl = urlWithTrackingParams({
              baseUrl: `/products/${product.handle}`,
              trackingParams: product.trackingParameters,
              term,
            });

            const price = product?.selectedOrFirstAvailableVariant?.price!;
            const image = product?.selectedOrFirstAvailableVariant?.image;

            return (
              <ProductItem
                key={product.id}
                product={{
                  ...product,
                  priceRange: {
                    minVariantPrice: price,
                    maxVariantPrice: price,
                  },
                }}
              />
            );
          });

          return (
            <div>
              <div>
                <PreviousLink>
                  {isLoading ? 'Loading...' : <span>↑ Load previous</span>}
                </PreviousLink>
              </div>
              <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
                {ItemsMarkup}
                <br />
              </div>
              <div>
                <NextLink>
                  {isLoading ? 'Loading...' : <span>Load more ↓</span>}
                </NextLink>
              </div>
            </div>
          );
        }}
      </Pagination>
      <br />
    </div>
  );
}

function SearchResultsEmpty({term}: {term: string}) {
  return (
    <EmptyState
      title="No results found"
      body={`No results found for "${term}". try a different search for ${term}`}
    />
  );
}
