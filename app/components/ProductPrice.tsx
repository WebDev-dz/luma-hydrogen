import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

export function ProductPrice({
  price,
  compareAtPrice,
}: {
  price: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
}) {
  return (
    <div aria-label="Price" className="product-price" role="group">
      {(compareAtPrice && compareAtPrice > price) ? (
        <div className="product-price-on-sale">
          {price ? <Money className="text-primary" data={price} /> : null}
          <s>
            <Money data={compareAtPrice} />
          </s>
        </div>
      ) : price ? (
        <Money className="text-primary" data={price} />
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );
}
