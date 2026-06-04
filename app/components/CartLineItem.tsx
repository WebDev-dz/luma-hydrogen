import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout, LineItemChildrenMap} from '~/components/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';
import {Minus, Plus, Trash2} from 'lucide-react';
import type {
  CartApiQueryFragment,
  CartLineFragment,
} from 'storefrontapi.generated';

export type CartLine = OptimisticCartLine<CartApiQueryFragment>;

export function CartLineItem({
  layout,
  line,
  childrenMap,
}: {
  layout: CartLayout;
  line: CartLine;
  childrenMap: LineItemChildrenMap;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();
  const lineItemChildren = childrenMap[id];
  const childrenLabelId = `cart-line-children-${id}`;

  const isPage = layout === 'page';

  return (
    <li key={id} className={isPage ? 'py-6' : 'py-1'}>
      <div className="flex gap-4">
        <Link
          prefetch="intent"
          to={lineItemUrl}
          onClick={() => {
            if (layout === 'aside') close();
          }}
          className={`shrink-0 overflow-hidden rounded-lg bg-cream ${isPage ? 'h-28 w-28 sm:h-32 sm:w-32' : 'h-20 w-20'}`}
        >
          {image && (
            <Image
              alt={title}
              aspectRatio="1/1"
              data={image}
              height={isPage ? 160 : 100}
              width={isPage ? 160 : 100}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          )}
        </Link>

        <div className="flex flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link
                prefetch="intent"
                to={lineItemUrl}
                onClick={() => {
                  if (layout === 'aside') close();
                }}
                className={`line-clamp-2 font-medium leading-snug text-foreground hover:text-primary ${isPage ? 'text-base' : 'text-sm'}`}
              >
                {product.title}
              </Link>
              {selectedOptions.length > 0 &&
                selectedOptions[0].value !== 'Default Title' && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selectedOptions.map((o) => o.value).join(' · ')}
                  </p>
                )}
            </div>
            <CartLineRemoveButton lineIds={[id]} disabled={!!line.isOptimistic} />
          </div>

          <div className="mt-auto flex items-end justify-between pt-3">
            <CartLineQuantity line={line} />
            <span className={`font-medium text-foreground ${isPage ? 'text-base' : 'text-sm'}`}>
              <ProductPrice price={line?.cost?.totalAmount} />
            </span>
          </div>
        </div>
      </div>

      {lineItemChildren ? (
        <div>
          <p id={childrenLabelId} className="sr-only">
            Line items with {product.title}
          </p>
          <ul aria-labelledby={childrenLabelId} className="cart-line-children">
            {lineItemChildren.map((childLine) => (
              <CartLineItem
                childrenMap={childrenMap}
                key={childLine.id}
                line={childLine}
                layout={layout}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="flex items-center rounded-full border border-border">
      <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
        <button
          aria-label="Decrease quantity"
          disabled={quantity <= 1 || !!isOptimistic}
          name="decrease-quantity"
          value={prevQuantity}
          className="flex h-7 w-7 items-center justify-center text-foreground hover:bg-secondary disabled:opacity-40"
        >
          <Minus className="h-3 w-3" />
        </button>
      </CartLineUpdateButton>
      <span className="w-7 text-center text-xs">{quantity}</span>
      <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
        <button
          aria-label="Increase quantity"
          name="increase-quantity"
          value={nextQuantity}
          disabled={!!isOptimistic}
          className="flex h-7 w-7 items-center justify-center text-foreground hover:bg-secondary disabled:opacity-40"
        >
          <Plus className="h-3 w-3" />
        </button>
      </CartLineUpdateButton>
    </div>
  );
}

function CartLineRemoveButton({
  lineIds,
  disabled,
}: {
  lineIds: string[];
  disabled: boolean;
}) {
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button
        disabled={disabled}
        type="submit"
        aria-label="Remove"
        className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const lineIds = lines.map((line) => line.id);
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}