import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {useRef} from 'react';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

export function CartSummary({cart, layout}: CartSummaryProps) {
  const isPage = layout === 'page';

  return (
    <div
      aria-labelledby="cart-summary"
      className={
        isPage
          ? 'sticky top-6 rounded-2xl border border-border bg-cream/40 px-6 py-6'
          : 'border-t border-border bg-cream/40 px-6 py-5'
      }
    >
      {isPage && (
        <h2 id="cart-summary" className="mb-5 font-serif text-xl text-foreground">
          Order Summary
        </h2>
      )}
      <div className="mb-1 flex items-center justify-between text-sm text-muted-foreground">
        <span>Subtotal</span>
        <span className="font-medium text-foreground">
          {cart?.cost?.subtotalAmount?.amount ? (
            <Money data={cart.cost.subtotalAmount} />
          ) : (
            '-'
          )}
        </span>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        Shipping &amp; taxes calculated at checkout.
      </p>

      <CartDiscounts discountCodes={cart?.discountCodes} />
      <CartCheckoutActions checkoutUrl={cart?.checkoutUrl} />
    </div>
  );
}

function CartCheckoutActions({checkoutUrl}: {checkoutUrl?: string}) {
  if (!checkoutUrl) return null;
  return (
    <a
      href={checkoutUrl}
      target="_self"
      className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
    >
      Checkout
    </a>
  );
}

function CartDiscounts({
  discountCodes,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
}) {
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <div className="mb-4">
      {codes.length > 0 && (
        <UpdateDiscountForm>
          <div className="mb-2 flex items-center justify-between text-xs">
            <code className="text-muted-foreground">{codes.join(', ')}</code>
            <button
              type="submit"
              className="text-muted-foreground underline hover:text-foreground"
            >
              Remove
            </button>
          </div>
        </UpdateDiscountForm>
      )}
      <UpdateDiscountForm discountCodes={codes}>
        <div className="flex gap-2">
          <input
            type="text"
            name="discountCode"
            placeholder="Discount code"
            className="flex-1 rounded-full border border-border bg-transparent px-4 py-2 text-xs focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-full border border-border px-4 py-2 text-xs font-medium hover:bg-secondary"
          >
            Apply
          </button>
        </div>
      </UpdateDiscountForm>
    </div>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{discountCodes: discountCodes || []}}
    >
      {children}
    </CartForm>
  );
}