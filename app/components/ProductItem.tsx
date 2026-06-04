import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';

export function ProductItem({
  product,
  loading,
}: {
  product:
    | CollectionItemFragment
    | ProductItemFragment
    | RecommendedProductFragment;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage || product?.selectedOrFirstAvailableVariant?.image;
  const price = product.priceRange.minVariantPrice;
  const compareAt = product?.compareAtPriceRange?.minVariantPrice;
  const onSale =
    compareAt && Number(compareAt.amount) > Number(price.amount);

  return (
    <Link
      className="product-item group block"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-cream">
        {image ? (
          <Image
            alt={image.altText || product.title}
            aspectRatio="1/1"
            data={image}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading={loading}
            sizes="(min-width: 45em) 400px, 100vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
        {onSale && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.15em] text-primary-foreground">
            Sale
          </span>
        )}
      </div>
      <div className="mt-4 space-y-1">
        <h4 className="line-clamp-1 text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
          {product.title}
        </h4>
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-foreground">
            <Money data={price} />
          </span>
          {onSale && (
            <s className="text-xs text-muted-foreground">
              <Money data={compareAt} />
            </s>
          )}
        </div>
      </div>
    </Link>
  );
}