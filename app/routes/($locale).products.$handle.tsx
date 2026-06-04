import {
  Link,
  redirect,
  useLoaderData,
  useNavigate,
  useSearchParams,
  Await,
} from 'react-router';
import type {Route} from './+types/($locale).products.$handle';
import {
  getSelectedProductOptions,
  Image,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {ProductItem} from '~/components/ProductItem';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ChevronLeft} from 'lucide-react';
import {useMemo, Suspense} from 'react';

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: `Hydrogen | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args, criticalData.product.id);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context, params}: Route.LoaderArgs, productId: string) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY, {
      variables: {productId},
    })
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  return {recommendedProducts};
}

export default function Product() {
  const {product, recommendedProducts} = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const adjacentAndFirstAvailableVariants =
    getAdjacentAndFirstAvailableVariants(product);
  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    adjacentAndFirstAvailableVariants,
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml, media} = product;

  const galleryVariants = useMemo(() => {
    const seenImageIds = new Set<string>();
    return adjacentAndFirstAvailableVariants.filter((variant) => {
      const imageId = variant.image?.id;
      if (!imageId) return false;
      if (seenImageIds.has(imageId)) return false;
      seenImageIds.add(imageId);
      return true;
    });
  }, [adjacentAndFirstAvailableVariants]);

  return (
    <>
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-8 lg:px-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Back to shop
        </Link>
        <div className="product mt-8 grid gap-12 lg:grid-cols-2">
          <div>
            <ProductImage
              key={product.handle}
              image={selectedVariant?.image}
            />
          </div>

          <div className="product-main">
            <div className="lg:py-6">
              <h1 className="font-serif text-3xl leading-tight sm:text-4xl">
                {title}
              </h1>
              <p className="mt-3 text-xl text-foreground">
                <ProductPrice
                  price={selectedVariant?.price}
                  compareAtPrice={selectedVariant?.compareAtPrice}
                />
              </p>
            </div>

            <br />
            <ProductForm
              productOptions={productOptions}
              selectedVariant={selectedVariant}
            />
            <br />
            <br />
            <p>
              <strong>Description</strong>
            </p>
            <br />
            <div dangerouslySetInnerHTML={{__html: descriptionHtml}} />
            <br />
          </div>
          <Analytics.ProductView
            data={{
              products: [
                {
                  id: product.id,
                  title: product.title,
                  price: selectedVariant?.price.amount || '0',
                  vendor: product.vendor,
                  variantId: selectedVariant?.id || '',
                  variantTitle: selectedVariant?.title || '',
                  quantity: 1,
                },
              ],
            }}
          />
        </div>
      </div>
      <RecommendedProducts products={recommendedProducts} />
    </>
  );
}

function RecommendedProducts({
  products,
}: {
  products: Promise<any | null>;
}) {
  return (
    <section className="mx-auto max-w-7xl px-2 sm:px-6 md:px-8 py-20 lg:px-10" aria-labelledby="recommended-products">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Curated
          </p>
          <h2 id="recommended-products" className="font-serif text-3xl">
            Similar Products
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
                ? response.productRecommendations.map((product: any, i: number) => (
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

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const MEDIA_FRAGMENT = `#graphql
  fragment Media on Media {
    __typename
    id
    mediaContentType
    alt
    previewImage {
      id
      url
      altText
      width
      height
    }
    ... on MediaImage {
      image {
        id
        url
        altText
        width
        height
      }
    }
    ... on Video {
      sources {
        url
        mimeType
      }
    }
    ... on ExternalVideo {
      embedUrl
      host
    }
    ... on Model3d {
      sources {
        url
        mimeType
      }
    }
  }
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
      media(first: 50) {
        nodes {
          ...Media
        }
      }
    }
  }
  ${PRODUCT_FRAGMENT}
  ${MEDIA_FRAGMENT}
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
  query ProductRecommendations(
    $productId: ID!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    productRecommendations(productId: $productId, intent: RELATED) {
      ...RecommendedProduct
    }
  }
` as const;
