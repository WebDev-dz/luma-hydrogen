import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem, type CartLine} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import {ShoppingBag} from 'lucide-react';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

export type LineItemChildrenMap = {[parentId: string]: CartLine[]};
/** Returns a map of all line items and their children. */
function getLineItemChildrenMap(lines: CartLine[]): LineItemChildrenMap {
  const children: LineItemChildrenMap = {};
  for (const line of lines) {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      const parentId = line.parentRelationship.parent.id;
      if (!children[parentId]) children[parentId] = [];
      children[parentId].push(line);
    }
    if ('lineComponents' in line) {
      const children = getLineItemChildrenMap(line.lineComponents);
      for (const [parentId, childIds] of Object.entries(children)) {
        if (!children[parentId]) children[parentId] = [];
        children[parentId].push(...childIds);
      }
    }
  }
  return children;
}
/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 */
export function CartMain({layout, cart: originalCart}: CartMainProps) {
  const cart = useOptimisticCart(originalCart);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;
  const childrenMap = getLineItemChildrenMap(cart?.lines?.nodes ?? []);
  const isPage = layout === 'page';

  return (
    <section aria-label={isPage ? 'Cart page' : 'Cart drawer'}>
      <CartEmpty hidden={linesCount} layout={layout} />
      <div
        className={
          isPage
            ? 'mx-auto max-w-7xl px-6 py-10 lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-12 lg:px-10 lg:py-14'
            : 'cart-details'
        }
      >
        <div>
          <p id="cart-lines" className="sr-only">Line items</p>
          <ul
            aria-labelledby="cart-lines"
            className={isPage ? 'divide-y divide-border' : ''}
          >
            {(cart?.lines?.nodes ?? []).map((line) => {
              if (
                'parentRelationship' in line &&
                line.parentRelationship?.parent
              ) {
                return null;
              }
              return (
                <CartLineItem
                  key={line.id}
                  line={line}
                  layout={layout}
                  childrenMap={childrenMap}
                />
              );
            })}
          </ul>
        </div>
        {cartHasItems && <CartSummary cart={cart} layout={layout} />}
      </div>
    </section>
  );
}

function CartEmpty({
  hidden = false,
  layout,
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  const {close} = useAside();
  const isPage = layout === 'page';

  return (
    <div hidden={hidden}>
      <div
        className={
          isPage
            ? 'mx-auto flex max-w-7xl flex-col items-center justify-center px-6 py-32 text-center lg:px-10'
            : 'flex flex-col items-center justify-center py-16 text-center'
        }
      >
        <ShoppingBag
          className="h-12 w-12 text-muted-foreground/40"
          strokeWidth={1}
        />
        <h2 className="mt-4 font-serif text-2xl text-foreground">
          Your cart is empty
        </h2>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          Looks like you haven&rsquo;t added anything yet — let&rsquo;s fix
          that.
        </p>
        <Link
          to="/collections"
          onClick={close}
          prefetch="viewport"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Browse Collections
        </Link>
      </div>
    </div>
  );
}
